import * as functions from 'firebase-functions';
import { ListingData } from 'types';
import logger from '../logger';
import formatListingData from './formatListingData';
import listingDataChanged from './listingDataChanged';
import validListingData from './validListingData';

/**
 * handles when a listing document is created. Validate => format => resize
 * error codes:
 * 0: Document snapshot that triggers onCreate does not exist
 * 1: Could not delete document when listing data is invalid
 * 2: Could not update document when listing data is formatted
 * 3: Could not resize images
 * 4: Could not update document when image is resized
 */
const onCreateListing = functions.firestore
	.document('listings/{listingId}')
	.onCreate(async (snapshot: functions.firestore.QueryDocumentSnapshot) => {
		if (!snapshot.exists) {
			return logger.error(
				`[ERROR 0]: Document snapshot that triggers onCreate does not exist: ${snapshot.id}`
			);
		}
		const listingData = snapshot.data() as ListingData;

		// validate data, if not => delete
		if (!validListingData(listingData)) {
			try {
				logger.log('Invalid listing data');
				await snapshot.ref.delete();
			} catch (error) {
				logger.error(
					`[ERROR 1]: Could not delete document when listing data is invalid: ${snapshot.id}`
				);
				logger.error(error);
				return 'error';
			}
		}

		// format data, if data changed then update
		const newListingData = formatListingData(listingData);
		if (listingDataChanged(listingData, newListingData)) {
			try {
				await snapshot.ref.set(newListingData);
			} catch (error) {
				logger.error(
					`[ERROR 2]: Could not update document when listing data is formatted: ${snapshot.id}`
				);
				logger.error(error);
				return 'error';
			}
		}
		return 'ok';
	});

export default onCreateListing;
