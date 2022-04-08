import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { ListingDataCl, UserInfo } from 'types';
import { db, svTime } from '../firebase.config';
import Logger from '../Logger';
import { fetchUserInfo } from '../utils';

const logger = new Logger();

const updateListing = functions.https.onCall(
	async (listingData: ListingDataCl, context) => {
		if (!context.auth) {
			logger.error('User unauthenticated');
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}
		const seller: UserInfo = await fetchUserInfo(listingData.seller.uid);
		const createdAtSeconds = listingData.createdAt?._seconds;
		const createdAtNanoseconds = listingData.createdAt?._nanoseconds;

		if (!createdAtSeconds || !createdAtNanoseconds) {
			logger.error('listing data time created was missing');
			throw new functions.https.HttpsError(
				'failed-precondition',
				'listing data time created was missing'
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
		try {
			await db
				.collection('listings')
				.doc(listingData.id)
				.update(updatedListing);
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				'Fail to update listing',
				error
			);
		}
		return 'ok';
	}
);

export default updateListing;
