import * as functions from 'firebase-functions';
import { ListingData } from 'types';
import { db, storage } from '../firebase.config';
import Logger from '../Logger';

const logger = new Logger();

/**
 * handles when a listing document is deleted
 */
const onDeleteGuestListing = functions.firestore
	.document('guest_listings/{listingId}')
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
							const fileRef = storage.file(imageRef);
							try {
								const [exists] = await fileRef.exists();
								if (exists) {
									await storage.file(imageRef).delete();
									logger.log(`Deleted image: ${imageRef}`);
								} else {
									logger.log(`Image does not exist: ${imageRef}`);
								}
							} catch (error) {
								logger.error(error);
								throw logger.error(
									`[ERROR 1]: Could not check for image reference existence: ${imageRef}`
								);
							}
						} catch (error) {
							logger.error(error);
							throw logger.error(
								`[ERROR 1]: Could not delete image when listing data is deleted: ${imageRef}`
							);
						}
					})
				);
			} catch (error) {
				logger.error(error);
				logger.error(
					`[ERROR 1]: Could not delete image when listing data is deleted: ${context.params.listingId}`
				);
				return 'error';
			}

			const { likedBy } = listingData;

			const batch = db.batch();
			likedBy.forEach((uid) => {
				batch.delete(
					db
						.collection('users')
						.doc(uid)
						.collection('wishlist')
						.doc(listingData.id)
				);
			});
			try {
				await batch.commit();
				logger.log(`Updated user's wishlist data: [${likedBy.join(', ')}]`);
			} catch (error) {
				logger.error(error);
				logger.error(
					`[ERROR 2]: Could not delete wishlist when listing data is deleted: ${context.params.listingId}`
				);
				return 'error';
			}
			return 'ok';
		}
	);

export default onDeleteGuestListing;
