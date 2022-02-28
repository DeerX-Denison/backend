import * as functions from 'firebase-functions';
import { ListingData, ListingImageMetadata } from 'types';
import { INVALID_IMAGE_CONTENT_IMAGE_URL } from '../constants';
import { db, storage } from '../firebase.config';
import Logger from '../Logger';
import resizeImage from './resizeImage';
import validImageContent from './validImageContent';
import validMetadata from './validMetadata';

const logger = new Logger();

/**
 * function that triggers to verify newly added image has valid metadata. This should prevent malicious user to abuse REST end points to programatically upload image. Normal user that uploads image through the app should pass this function.
 */
const imageUploadHandler = functions.storage
	.object()
	.onFinalize(async (obj: functions.storage.ObjectMetadata) => {
		const imageRef = obj.id.substring(
			obj.id.indexOf('/') + 1,
			obj.id.lastIndexOf('/')
		);
		const listingId = imageRef.split('/')[1];
		const imageFile = storage.file(imageRef);
		const metaRes = await imageFile.getMetadata();
		const imageMetadata: ListingImageMetadata = metaRes[0].metadata;

		if (!validMetadata(obj)) {
			try {
				await storage.file(imageRef).delete();
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
					await storage.file(imageRef).delete();
				} catch (error) {
					logger.error(
						`[ERROR 1]: Can't delete image with invalid content: ${imageRef}`
					);
					return 'error';
				}

				let images: string[];
				try {
					const docSnap = await db.collection('listings').doc(listingId).get();
					const listingData = docSnap.data() as ListingData;
					images = listingData.images;
				} catch (error) {
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
					await db
						.collection('listings')
						.doc(listingId)
						.update({ images: newImages });
				} catch (error) {
					logger.error(
						`[ERROR 3]: Can't udpate current listing data with updated images`
					);
					return 'error';
				}
				return 'ok';
			}
		}

		if (imageMetadata.resized === 'false') {
			try {
				await resizeImage(imageRef);
			} catch (error) {
				logger.error(`[ERROR 4]: Can't resize image: ${imageRef}`);
				return 'error';
			}
		}

		return 'ok';
	});

export default imageUploadHandler;
