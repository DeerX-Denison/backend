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
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}
		if (context.auth.uid !== listingData.seller.uid) {
			throw new functions.https.HttpsError(
				'permission-denied',
				`Invoker is not listing's seller: ${context.auth.uid}`
			);
		}

		const seller: UserInfo = await fetchUserInfo(listingData.seller.uid);

		if ('disabled' in seller && seller.disabled === true) {
			throw new functions.https.HttpsError(
				'permission-denied',
				`Invoker account is disabled: ${seller.uid}`
			);
		}

		const createdAtSeconds = listingData.createdAt?._seconds;
		const createdAtNanoseconds = listingData.createdAt?._nanoseconds;
		if (!createdAtSeconds || !createdAtNanoseconds) {
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
			logger.log(`Updated listing data: ${listingData.id}`);
		} catch (error) {
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
