import { INVALID_IMAGE_CONTENT_IMAGE_URL } from '../../constants';
import Logger from '../../Logger';
import validImageContent from '../validImageContent';
import resizeImage from './resizeImage';
import validMetadata from './validMetadata';
import { ListingImageMetadata, Listing } from '../../models/listing';
import { Firebase } from '../../services/firebase-service';
import { ObjectMetadata } from 'firebase-functions/v1/storage';

const logger = new Logger();

/**
 * function that triggers to verify newly added listing image has valid metadata. This should prevent malicious user to abuse REST end points to programatically upload image. Normal user that uploads image through the app should pass this function.
 */
const uploadListingImageHandler = Firebase.functions.storage
	.object()
	.onFinalize(async (obj: ObjectMetadata) => {
		const imageRef = obj.id.substring(
			obj.id.indexOf('/') + 1,
			obj.id.lastIndexOf('/')
		);
		if (imageRef.split('/')[0] !== 'listings') return 'ok';

		const listingId = imageRef.split('/')[1];
		const imageFile = Firebase.storage.file(imageRef);
		const metaRes = await imageFile.getMetadata();
		logger.log(
			`Fetched image metadata for content validation and resize: ${imageRef}`
		);
		const imageMetadata = ListingImageMetadata.parse(metaRes[0].metadata);

		if (!validMetadata(obj)) {
			try {
				await Firebase.storage.file(imageRef).delete();
				logger.log(`Deleted image: ${imageRef}`);
			} catch (error) {
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

				let images: string[];
				try {
					const docSnap = await Firebase.db
						.collection('listings')
						.doc(listingId)
						.get();
					if (docSnap.exists) {
						const listingData = Listing.parse(docSnap.data());
						images = listingData.images;
						logger.log(`Fetch current listing data's images: ${imageRef}`);
					} else {
						throw `DocSnap does not exist: ${listingId}`;
					}
				} catch (error) {
					logger.log(error);
					logger.error(`[ERROR 2]: Can't fetch current listing data to update`);
					return 'error';
				}

				const newImages = images.map((imageUrl) => {
					const listingImageRef = imageUrl
						.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('?'))
						.replace(/%2F/g, '/');
					if (imageRef === listingImageRef) {
						return INVALID_IMAGE_CONTENT_IMAGE_URL;
					} else {
						return imageUrl;
					}
				});

				try {
					await Firebase.db
						.collection('listings')
						.doc(listingId)
						.update({ images: newImages });
					logger.log(`Updated content validated image: ${imageRef}`);
				} catch (error) {
					logger.error(
						`[ERROR 3]: Can't update current listing data with updated images`
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
				logger.error(`[ERROR 4]: Can't resize image: ${imageRef}`);
				return 'error';
			}
		}

		return 'ok';
	});

export default uploadListingImageHandler;
