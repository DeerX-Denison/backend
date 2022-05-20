import * as functions from 'firebase-functions';
import { ListingData } from 'types';
import Logger from '../Logger';
import formatListingData from './formatListingData';
import listingDataChanged from './listingDataChanged';
import validListingData from './validListingData';
const logger = new Logger();
/**
 * handles when a listing document is created. Validate => format => resize
 */
const onCreateGuestListing = functions.firestore
	.document('guest_listings/{listingId}')
	.onCreate(async (snapshot: functions.firestore.QueryDocumentSnapshot) => {
		if (!snapshot.exists) {
			logger.error(
				`[ERROR 0]: Document snapshot that triggers onCreate does not exist: ${snapshot.id}`
			);
			return 'error';
		}
		const listingData = snapshot.data() as ListingData;

		// validate data, if not => delete
		if (!validListingData(listingData)) {
			try {
				await snapshot.ref.delete();
				logger.log(`Invalid listing data, deleted: ${listingData.id}`);
			} catch (error) {
				logger.error(error);
				logger.error(
					`[ERROR 1]: Could not delete document when listing data is invalid: ${snapshot.id}`
				);
				return 'error';
			}
		}

		// format data, if data changed then update
		const newListingData = formatListingData(listingData);
		if (listingDataChanged(listingData, newListingData)) {
			try {
				await snapshot.ref.set(newListingData);
				logger.log(`Listing data formatted: ${listingData.id}`);
			} catch (error) {
				logger.error(error);
				logger.error(
					`[ERROR 2]: Could not update document when listing data is formatted: ${snapshot.id}`
				);
				return 'error';
			}
		}
		return 'ok';
	});

export default onCreateGuestListing;
