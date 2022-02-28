import * as functions from 'firebase-functions';
import { ListingData } from 'types';
import { storage } from '../firebase.config';
import Logger from '../Logger';

const logger = new Logger();

/**
 * handles when a listing document is deleted
 * error codes:
 * 0: Document that triggers onDelete does not exist
 * 1: Could not delete image when listing data is deleted
 */
const onDeleteListing = functions.firestore
	.document('listings/{listingId}')
	.onDelete(
		async (
			snapshot: functions.firestore.QueryDocumentSnapshot,
			context: functions.EventContext
		) => {
			if (!snapshot.exists) {
				logger.error(
					`[ERROR 0]: Document snapshot that triggers onDelete does not exist: ${snapshot.id}`
				);
				return 'error';
			}

			const listingData = snapshot.data() as ListingData;
			const imagesRef = listingData.images.map((imageUrl) =>
				imageUrl
					.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('?'))
					.replace(/%2F/g, '/')
			);

			try {
				await Promise.all(
					imagesRef.map(async (imageRef) => {
						try {
							await storage.file(imageRef).delete();
						} catch (error) {
							logger.error(
								`[ERROR 1]: Could not delete image when listing data is deleted: ${imageRef}`
							);
							throw logger.error(error);
						}
					})
				);
			} catch (error) {
				logger.error(
					`[ERROR 1]: Could not delete image when listing data is deleted: ${context.params.listingId}`
				);
				logger.error(error);
				return 'error';
			}

			return 'ok';
		}
	);

export default onDeleteListing;
