import { ListingImageMetadata, Listing } from '../../models/listing';
import { Firebase } from '../../services/firebase';
import { Logger } from '../../services/logger';
import { OnUploadListingImageResponse } from '../../models/response/images/on-upload-listing-image-response';
import { Config } from '../../config';
import { ImageDetector } from '../../services/image-detector';
import { ImageResizer } from '../../services/image-resizer';

/**
 * function that triggers to verify newly added listing image has valid metadata. This should prevent malicious user to abuse REST end points to programatically upload image. Normal user that uploads image through the app should pass this function.
 */
export const onUploadListingImage = Firebase.functions.storage
	.object()
	.onFinalize(async (obj) => {
		// extract image data
		const imageRef = obj.id.substring(
			obj.id.indexOf('/') + 1,
			obj.id.lastIndexOf('/')
		);

		if (imageRef.split('/')[0] !== 'listings')
			return OnUploadListingImageResponse.ok;

		const listingId = imageRef.split('/')[1];

		const imageFile = Firebase.storage.file(imageRef);

		const metaRes = await imageFile.getMetadata();

		Logger.log(
			`Fetched image metadata for content validation and resize: ${imageRef}`
		);

		const imageMetadata = ListingImageMetadata.parse(metaRes[0].metadata);

		if (!ImageDetector.validListingImageMetadata(obj)) {
			try {
				await Firebase.storage.file(imageRef).delete();
				Logger.log(`Deleted image: ${imageRef}`);
			} catch (error) {
				Logger.error(
					`[ERROR 0]: Can't delete image with invalid metadata: ${imageRef}`
				);
				return OnUploadListingImageResponse.error;
			}
			return OnUploadListingImageResponse.ok;
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
					return OnUploadListingImageResponse.error;
				}

				let images: string[];
				try {
					const docSnap = await Firebase.db
						.collection('listings')
						.doc(listingId)
						.get();
					if (docSnap.exists) {
						const listingData = Listing.parse(docSnap.data());
						images = listingData.images;
						Logger.log(`Fetch current listing data's images: ${imageRef}`);
					} else {
						throw `DocSnap does not exist: ${listingId}`;
					}
				} catch (error) {
					Logger.log(error);
					Logger.error(`[ERROR 2]: Can't fetch current listing data to update`);
					return OnUploadListingImageResponse.error;
				}

				const newImages = images.map((imageUrl) => {
					const listingImageRef = imageUrl
						.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('?'))
						.replace(/%2F/g, '/');
					if (imageRef === listingImageRef) {
						return Config.invalidImageContentUrl;
					} else {
						return imageUrl;
					}
				});

				try {
					await Firebase.db
						.collection('listings')
						.doc(listingId)
						.update({ images: newImages });
					Logger.log(`Updated content validated image: ${imageRef}`);
				} catch (error) {
					Logger.error(
						`[ERROR 3]: Can't update current listing data with updated images`
					);
					return OnUploadListingImageResponse.error;
				}
				return OnUploadListingImageResponse.ok;
			}
		}

		if (imageMetadata.resized === 'false') {
			try {
				await ImageResizer.resizeImage(imageRef);
				Logger.log(`Successfully resized image: ${imageRef}`);
			} catch (error) {
				Logger.error(`[ERROR 4]: Can't resize image: ${imageRef}`);
				return OnUploadListingImageResponse.error;
			}
		}

		return OnUploadListingImageResponse.ok;
	});
