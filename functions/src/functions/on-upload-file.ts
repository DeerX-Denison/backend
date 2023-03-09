import { CloudStorage } from '../services/cloud-storage';
import { Firebase } from '../services/firebase';
import { onUploadListingImageHandler } from './listing/on-upload-listing-image-handler';
import { onUploadProfileImageHandler } from './user/on-upload-profile-image-handler';

export const onUploadFile = Firebase.functions.storage
	.object()
	.onFinalize(async (obj) => {
		const ref = CloudStorage.extractObjectRefFromId(obj.id);

		const paths = CloudStorage.extractPathsFromRef(ref);

		switch (paths[0]) {
			case 'listings':
				await onUploadListingImageHandler(obj);
				break;
			case 'profilePhotos':
				await onUploadProfileImageHandler(obj);
			// eslint-disable-next-line no-fallthrough
			default:
				break;
		}
	});
