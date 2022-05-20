import * as functions from 'firebase-functions';
import { ListingData } from 'types';
import { db, storage } from '../firebase.config';
import Logger from '../Logger';
import { getAllSubstrings } from '../utils';
import formatListingData from './formatListingData';
import listingDataChanged from './listingDataChanged';
import validListingData from './validListingData';

const logger = new Logger();

/**
 * handles when a listing document is created
 */
const onUpdateGuestListing = functions.firestore
	.document('guest_listings/{listingId}')
	.onUpdate(
		async (
			snapshot: functions.Change<functions.firestore.QueryDocumentSnapshot>,
			context: functions.EventContext
		) => {
			if (!snapshot.after.exists) {
				logger.error(
					`[ERROR 0]: After document snapshot that triggers onCreate does not exist: ${snapshot.after.id}`
				);
				return 'error';
			}
			const listingData = snapshot.after.data() as ListingData;

			// validate data, if not => delete
			if (!validListingData(listingData)) {
				try {
					await snapshot.after.ref.delete();
					logger.log(`Invalid listing data, deleted: ${listingData.id}`);
				} catch (error) {
					logger.error(error);
					logger.error(
						`[ERROR 1]: Could not delete document when listing data is invalid: ${snapshot.after.id}`
					);
					return 'error';
				}
			}

			// format data, if data changed then update
			const newListingData = formatListingData(listingData);
			if (listingDataChanged(listingData, newListingData)) {
				try {
					await snapshot.after.ref.set(newListingData);
					logger.log(`Listing data formatted: ${listingData.id}`);
					return;
				} catch (error) {
					logger.error(error);
					logger.error(
						`[ERROR 2]: Could not update document when listing data is formatted: ${snapshot.after.id}`
					);
					return 'error';
				}
			}

			// check for removed images, then delete them from storage
			const oldImagesUrl = (snapshot.before.data() as ListingData).images;
			const newImagesUrl = (snapshot.after.data() as ListingData).images;
			const deletedImagesUrl = oldImagesUrl.filter(
				(url) => !newImagesUrl.includes(url)
			);
			const deletedImageRef = deletedImagesUrl.map((imageUrl) =>
				imageUrl
					.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('?'))
					.replace(/%2F/g, '/')
			);
			try {
				await Promise.all(
					deletedImageRef.map(async (imageRef) => {
						try {
							const fileRef = storage.file(imageRef);
							try {
								const [exists] = await fileRef.exists();
								logger.log(`Checked for image existence: ${imageRef}`);

								if (exists) {
									await storage.file(imageRef).delete();
									logger.log(`Deleted image: ${imageRef}`);
								} else {
									logger.log(`Image does not exist: ${imageRef}`);
								}
							} catch (error) {
								logger.error(error);
								throw logger.error(
									`[ERROR 3]: Could not check for image reference existence: ${imageRef}`
								);
							}
						} catch (error) {
							logger.error(error);
							throw logger.error(
								`[ERROR 3]: Could not delete image when listing data is deleted: ${imageRef}`
							);
						}
					})
				);
			} catch (error) {
				logger.error(error);
				logger.error(
					`[ERROR 3]: Could not delete image when listing data is deleted: ${context.params.listingId}`
				);
				return 'error';
			}

			// update name and searchable keywords on all the people who added the listing to wishlist
			const oldName = (snapshot.before.data() as ListingData).name;
			const newName = (snapshot.after.data() as ListingData).name;
			const oldPrice = (snapshot.before.data() as ListingData).price;
			const newPrice = (snapshot.after.data() as ListingData).price;

			const batch = db.batch();
			const { likedBy } = listingData;
			if (newName !== oldName) {
				const searchableKeyword = getAllSubstrings(newName);
				likedBy.forEach((uid) => {
					batch.update(
						db
							.collection('users')
							.doc(uid)
							.collection('wishlist')
							.doc(listingData.id),
						{ searchableKeyword, name: newName }
					);
				});
			}
			if (newPrice !== oldPrice) {
				likedBy.forEach((uid) => {
					batch.update(
						db
							.collection('users')
							.doc(uid)
							.collection('wishlist')
							.doc(listingData.id),
						{ price: newPrice }
					);
				});
			}
			try {
				await batch.commit();
				logger.log(`Updated user's wishlist data: [${likedBy.join(', ')}]`);
			} catch (error) {
				logger.error(error);
				logger.error(
					`[ERROR 4]: Could not batch update users' wishlist: ${snapshot.after.id}`
				);
			}
			return 'ok';
		}
	);

export default onUpdateGuestListing;
