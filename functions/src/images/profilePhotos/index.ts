import { DEFAULT_USER_PHOTO_URL } from '../../constants';
import Logger from '../../Logger';
import { ListingImageMetadata, UserInfo } from '../../types';
import userNameAndPhoto from '../../user/users.json';
import { fetchUserInfo } from '../../utils';
import resizeImage from '../listings/resizeImage';
import validImageContent from '../validImageContent';
import validMetadata from './validMetadata';
import { Firebase } from '../../services/firebase-service';
import { ObjectMetadata } from 'firebase-functions/v1/storage';

const logger = new Logger();

// typing of the user file that maps displayName and photoURL
type UserFile = {
	[key: string]: { img: string; name: string; email: string };
};

/**
 * function that triggers to verify newly added profile image has valid metadata. This should prevent malicious user to abuse REST end points to programatically upload image. Normal user that uploads image through the app should pass this function.
 */
const uploadProfileImageHandler = Firebase.functions.storage
	.object()
	.onFinalize(async (obj: ObjectMetadata) => {
		const imageRef = obj.id.substring(
			obj.id.indexOf('/') + 1,
			obj.id.lastIndexOf('/')
		);
		if (imageRef.split('/')[0] !== 'profilePhotos') return 'ok';
		const uid = imageRef.split('/')[1];
		const imageFile = Firebase.storage.file(imageRef);
		const metaRes = await imageFile.getMetadata();
		logger.log(`Fetched image metadata: ${imageRef}`);
		const imageMetadata: ListingImageMetadata = metaRes[0].metadata;

		if (!validMetadata(obj)) {
			try {
				await Firebase.storage.file(imageRef).delete();
				logger.log(`Deleted image: ${imageRef}`);
			} catch (error) {
				logger.error(error);
				logger.error(
					`[ERROR 0]: Can't delete image with invalid metadata: ${imageRef}`
				);
				return 'error';
			}
			return 'ok';
		}

		if (imageMetadata.contentValidated === 'false') {
			if (!(await validImageContent(imageRef))) {
				try {
					await Firebase.storage.file(imageRef).delete();
					logger.log(`Invalid image content, deleted: ${imageRef}`);
				} catch (error) {
					logger.error(
						`[ERROR 1]: Can't delete image with invalid content: ${imageRef}`
					);
					return 'error';
				}
				let userInfo: UserInfo | undefined;
				try {
					userInfo = await fetchUserInfo(uid);
					if (!userInfo) throw 'User info is undefined after fetched';
				} catch (error) {
					logger.error(error);
					logger.error(`[ERROR 2]: Can't fetch user with uid: ${uid}`);
					return 'error';
				}
				const { email } = userInfo;
				const userFile = userNameAndPhoto as UserFile;
				// get default photoURL of the user
				let photoURL: string;
				if (email && email in userFile) {
					if ('img' in userFile[email]) {
						photoURL = userFile[email].img;
					} else {
						photoURL = DEFAULT_USER_PHOTO_URL;
					}
				} else {
					photoURL = DEFAULT_USER_PHOTO_URL;
				}

				try {
					await Firebase.db.collection('users').doc(uid).update({ photoURL });
					logger.log(`Updated user profile photo in database: ${imageRef}`);
				} catch (error) {
					logger.error(error);
					logger.error(`[ERROR 3]: Can't update firestore: ${imageRef}`);
					return 'error';
				}
				try {
					await Firebase.auth.updateUser(uid, { photoURL: photoURL });
					logger.log(`Updated user profile photo in firebase: ${imageRef}`);
				} catch (error) {
					logger.error(error);
					logger.error(
						`[ERROR 4]: Can't update user profile in firebase: ${imageRef}`
					);
					return 'error';
				}
				return 'ok';
			}
		}

		if (imageMetadata.resized === 'false') {
			try {
				await resizeImage(imageRef);
				logger.log(`Successfully resized image: ${imageRef}`);
			} catch (error) {
				logger.error(`[ERROR 5]: Can't resize image: ${imageRef}`);
				return 'error';
			}
		}

		return 'ok';
	});

export default uploadProfileImageHandler;
