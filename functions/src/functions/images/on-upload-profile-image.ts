import { Logger } from '../../services/logger';
import { ListingImageMetadata, UserInfo } from '../../types';
import userNameAndPhoto from '../../user/users.json';
import { fetchUserInfo } from '../../utils';
import { Firebase } from '../../services/firebase';
import { ImageDetector } from '../../services/image-detector';
import { ImageResizer } from '../../services/image-resizer';
import { Config } from '../../config';
import { OnUploadProfileImageResponse } from '../../models/response/images/on-upload-profile-image-response';

// typing of the user file that maps displayName and photoURL
type UserFile = {
	[key: string]: { img: string; name: string; email: string };
};

/**
 * function that triggers to verify newly added profile image has valid metadata. This should prevent malicious user to abuse REST end points to programatically upload image. Normal user that uploads image through the app should pass this function.
 */
export const uploadProfileImageHandler = Firebase.functions.storage
	.object()
	.onFinalize(async (obj) => {
		const imageRef = obj.id.substring(
			obj.id.indexOf('/') + 1,
			obj.id.lastIndexOf('/')
		);

		if (imageRef.split('/')[0] !== 'profilePhotos')
			return OnUploadProfileImageResponse.ok;

		const uid = imageRef.split('/')[1];

		const imageFile = Firebase.storage.file(imageRef);

		const metaRes = await imageFile.getMetadata();

		Logger.log(`Fetched image metadata: ${imageRef}`);

		const imageMetadata: ListingImageMetadata = metaRes[0].metadata;

		if (!ImageDetector.validProfileImageMetadata(obj)) {
			try {
				await Firebase.storage.file(imageRef).delete();
				Logger.log(`Deleted image: ${imageRef}`);
			} catch (error) {
				Logger.error(error);
				Logger.error(
					`[ERROR 0]: Can't delete image with invalid metadata: ${imageRef}`
				);
				return OnUploadProfileImageResponse.error;
			}
			return OnUploadProfileImageResponse.ok;
		}

		if (imageMetadata.contentValidated === 'false') {
			if (!(await ImageDetector.validImageContent(imageRef))) {
				try {
					await Firebase.storage.file(imageRef).delete();
					Logger.log(`Invalid image content, deleted: ${imageRef}`);
				} catch (error) {
					Logger.error(
						`[ERROR 1]: Can't delete image with invalid content: ${imageRef}`
					);
					return OnUploadProfileImageResponse.error;
				}
				let userInfo: UserInfo | undefined;
				try {
					userInfo = await fetchUserInfo(uid);
					if (!userInfo) throw 'User info is undefined after fetched';
				} catch (error) {
					Logger.error(error);
					Logger.error(`[ERROR 2]: Can't fetch user with uid: ${uid}`);
					return OnUploadProfileImageResponse.error;
				}
				const { email } = userInfo;
				const userFile = userNameAndPhoto as UserFile;
				// get default photoURL of the user
				let photoURL: string;
				if (email && email in userFile) {
					if ('img' in userFile[email]) {
						photoURL = userFile[email].img;
					} else {
						photoURL = Config.defaultUserPhotoURL;
					}
				} else {
					photoURL = Config.defaultUserPhotoURL;
				}

				try {
					await Firebase.db.collection('users').doc(uid).update({ photoURL });
					Logger.log(`Updated user profile photo in database: ${imageRef}`);
				} catch (error) {
					Logger.error(error);
					Logger.error(`[ERROR 3]: Can't update firestore: ${imageRef}`);
					return OnUploadProfileImageResponse.error;
				}
				try {
					await Firebase.auth.updateUser(uid, { photoURL: photoURL });
					Logger.log(`Updated user profile photo in firebase: ${imageRef}`);
				} catch (error) {
					Logger.error(error);
					Logger.error(
						`[ERROR 4]: Can't update user profile in firebase: ${imageRef}`
					);
					return OnUploadProfileImageResponse.error;
				}
				return OnUploadProfileImageResponse.ok;
			}
		}

		if (imageMetadata.resized === 'false') {
			try {
				await ImageResizer.resizeImage(imageRef);
				Logger.log(`Successfully resized image: ${imageRef}`);
			} catch (error) {
				Logger.error(`[ERROR 5]: Can't resize image: ${imageRef}`);
				return OnUploadProfileImageResponse.error;
			}
		}

		return OnUploadProfileImageResponse.ok;
	});
