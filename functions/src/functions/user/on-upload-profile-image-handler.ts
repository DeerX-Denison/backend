import { ObjectMetadata } from '../../services/firebase';
import { OnUploadProfileImageResponse } from '../../models/response/images/on-upload-profile-image-response';
import { CloudStorage } from '../../services/cloud-storage';
import { ProfileImageMetadata } from '../../models/image/profile-image-metadata';
import { User } from '../../models/user/user';
import { Utils } from '../../utils/utils';
import { Config } from '../../config';
import { Image } from '../../services/image';
import fs from 'fs/promises';
import { CloudVision } from '../../services/cloud-vision';

export const onUploadProfileImageHandler = async (obj: ObjectMetadata) => {
	const ref = CloudStorage.extractObjectRefFromId(obj.id);

	const paths = CloudStorage.extractPathsFromRef(ref);

	const uid = paths[1];

	const validContent = CloudStorage.validContentTypes(
		obj,
		Config.listingImageValidContentTypes
	);

	const validExtension = CloudStorage.validExtention(obj);

	if (!validContent || !validExtension) {
		await CloudStorage.delete(ref);
		return;
	}

	const metadata = await ProfileImageMetadata.get(ref);

	if (
		metadata.contentValidated === 'false' &&
		!(await CloudVision.validateContent(ref))
	) {
		await CloudStorage.delete(ref);

		const user = await User.get(uid);

		const defaultPhotoURL = User.getDefaultPhotoURL(user.email);

		await User.update(uid, { ...user, photoURL: defaultPhotoURL });

		return;
	}

	if (metadata.resized === 'false') {
		const fileName = CloudStorage.extractNameFromRef(ref);

		const tempPath = Utils.tempPath(fileName);

		await CloudStorage.download(ref, tempPath);

		const imageBuffer = await fs.readFile(tempPath);

		const resizedImageBuffer = await Image.resize(imageBuffer, {
			height: Config.profileImageHeight,
		});

		const metadata = await ProfileImageMetadata.get(ref);

		metadata.resized = 'true';

		await CloudStorage.save(ref, resizedImageBuffer, metadata);

		await fs.unlink(tempPath);

		return;
	}

	return OnUploadProfileImageResponse.ok;
};
