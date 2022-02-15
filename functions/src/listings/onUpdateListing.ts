import * as functions from 'firebase-functions';
import { ListingData } from 'types';
import logger from '../logger';
import formatListingData from './formatListingData';
import listingDataChanged from './listingDataChanged';
import validListingData from './validListingData';

/**
 * handles when a listing document is created
 * error codes:
 * 0: After document snapshot that triggers onUpdate does not exist
 * 1: Could not delete document when listing data is invalid
 * 2: Could not update document when listing data is formatted
 * 3: Could not delete from storage images that were removed from listing data
 * 4: Could not resize images
 * 5: Could not update document when image is resized
 */
const onUpdateListing = functions.firestore
	.document('listings/{listingId}')
	.onUpdate(
		async (
			snapshot: functions.Change<functions.firestore.QueryDocumentSnapshot>
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
					logger.log('Invalid listing data');
					return await snapshot.after.ref.delete();
				} catch (error) {
					logger.error(
						`[ERROR 1]: Could not delete document when listing data is invalid: ${snapshot.after.id}`
					);
					logger.error(error);
					return 'error';
				}
			}

			// format data, if data changed then update
			const newListingData = formatListingData(listingData);
			if (listingDataChanged(listingData, newListingData)) {
				try {
					await snapshot.after.ref.set(newListingData);
					return;
				} catch (error) {
					logger.error(
						`[ERROR 2]: Could not update document when listing data is formatted: ${snapshot.after.id}`
					);
					logger.error(error);
					return 'error';
				}
			}

			// check for removed images, then delete them from storage
			const oldImagesUrl = (snapshot.before.data() as ListingData).images;
			const newImagesUrl = (snapshot.after.data() as ListingData).images;
			const deletedImagesUrl = oldImagesUrl.filter(
				(url) => !newImagesUrl.includes(url)
			);
			try {
				deletedImagesUrl.forEach(async (imageUrl) => {
					const imageRef = imageUrl
						.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('?'))
						.replace(/%2F/g, '/');
					logger.log(imageRef);
				});
			} catch (error) {
				logger.error(
					`[ERROR 3]: Could not delete from storage images that were removed from listing data: ${snapshot.after.id}`
				);
				logger.error(error);
			}
			return 'ok';
		}
	);

export default onUpdateListing;
