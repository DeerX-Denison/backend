import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { ListingDataCl, UserInfo } from 'types';
import {
	DEFAULT_GUEST_DISPLAY_NAME,
	DEFAULT_GUEST_EMAIL,
	ERROR_MESSAGES,
} from '../constants';
import { db, svTime } from '../firebase.config';
import Logger from '../Logger';
import { isLoggedIn, isNotBanned } from '../utils';

const logger = new Logger();

const updateListing = functions.https.onCall(
	async (listingData: ListingDataCl, context) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);

		if (invoker.uid !== listingData.seller.uid) {
			logger.log(`Invoker is not listing's owner: ${invoker.uid}`);
			throw new functions.https.HttpsError(
				'permission-denied',
				ERROR_MESSAGES.notListingOwner
			);
		}

		const seller: UserInfo = invoker;

		const createdAtSeconds = listingData.createdAt?._seconds;
		const createdAtNanoseconds = listingData.createdAt?._nanoseconds;
		if (!createdAtSeconds || !createdAtNanoseconds) {
			logger.log('listing data time created was missing');
			throw new functions.https.HttpsError(
				'invalid-argument',
				ERROR_MESSAGES.invalidInput
			);
		}
		const updatedListing = {
			...listingData,
			seller,
			updatedAt: svTime(),
			createdAt: new admin.firestore.Timestamp(
				createdAtSeconds,
				createdAtNanoseconds
			),
		};
		if (
			invoker.displayName === DEFAULT_GUEST_DISPLAY_NAME &&
			invoker.email === DEFAULT_GUEST_EMAIL
		) {
			try {
				await db
					.collection('guest_listings')
					.doc(listingData.id)
					.update(updatedListing);
				logger.log(`Updated guest listing data: ${listingData.id}`);
			} catch (error) {
				throw new functions.https.HttpsError(
					'internal',
					ERROR_MESSAGES.failUpdateListing
				);
			}
		} else {
			try {
				await db
					.collection('listings')
					.doc(listingData.id)
					.update(updatedListing);
				logger.log(`Updated listing data: ${listingData.id}`);
			} catch (error) {
				throw new functions.https.HttpsError(
					'internal',
					ERROR_MESSAGES.failUpdateListing
				);
			}
		}
		return 'ok';
	}
);

export default updateListing;
