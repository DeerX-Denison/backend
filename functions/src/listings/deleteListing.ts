import * as functions from 'firebase-functions';
import { ListingData } from 'types';
import {
	DEFAULT_GUEST_DISPLAY_NAME,
	DEFAULT_GUEST_EMAIL,
	ERROR_MESSAGES,
} from '../constants';
import { db } from '../firebase.config';
import Logger from '../Logger';
import { isLoggedIn, isNotBanned } from '../utils';

const logger = new Logger();

const deleteListing = functions.https.onCall(
	async (listingData: ListingData, context) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);

		if (invoker.uid !== listingData.seller.uid) {
			logger.log(`Invoker is not listing's owner: ${invokerUid}`);
			throw new functions.https.HttpsError(
				'permission-denied',
				ERROR_MESSAGES.notListingOwner
			);
		}
		if (
			invoker.displayName === DEFAULT_GUEST_DISPLAY_NAME &&
			invoker.email === DEFAULT_GUEST_EMAIL
		) {
			try {
				await db.collection('guest_listings').doc(listingData.id).delete();
				logger.log(`Deleted guest listing: ${listingData.id}`);
			} catch (error) {
				logger.error(error);
				throw new functions.https.HttpsError(
					'internal',
					ERROR_MESSAGES.failDeleteListing
				);
			}
		} else {
			try {
				await db.collection('listings').doc(listingData.id).delete();
				logger.log(`Deleted listing: ${listingData.id}`);
			} catch (error) {
				logger.error(error);
				throw new functions.https.HttpsError(
					'internal',
					ERROR_MESSAGES.failDeleteListing
				);
			}
		}
		return 'ok';
	}
);

export default deleteListing;
