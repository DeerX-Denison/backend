import * as functions from 'firebase-functions';
import { db, svTime } from '../firebase.config';
import Logger from '../Logger';
import { ListingData, UserInfo } from '../types';
import { fetchUserInfo } from '../utils';

const logger = new Logger();

const createListing = functions.https.onCall(
	async (listingData: ListingData, context) => {
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

		// fetch updated user data
		const seller: UserInfo = await fetchUserInfo(listingData.seller.uid);

		// create new listing from user input listingData
		const newListingData: ListingData = {
			...listingData,
			seller,
			createdAt: svTime() as FirebaseFirestore.Timestamp,
			updatedAt: svTime() as FirebaseFirestore.Timestamp,
			likedBy: [],
		};

		// update new listing data to db
		try {
			await db.collection('listings').doc(listingData.id).set(newListingData);
			logger.log(`Created listing: ${listingData.id}`);
		} catch (error) {
			throw new functions.https.HttpsError(
				'internal',
				'Fail to create new listing',
				error
			);
		}
		return 'ok';
	}
);

export default createListing;
