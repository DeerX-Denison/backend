import * as functions from 'firebase-functions';
import { ListingData, UserInfo } from 'types';
import { db, svTime } from '../firebase.config';
import logger from '../logger';
import { fetchUser } from '../utils';

const createListing = functions.https.onCall(
	async (listingData: ListingData, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}

		const seller: UserInfo = await fetchUser(listingData.seller.uid);
		const newListingData: ListingData = {
			...listingData,
			seller,
			createdAt: svTime() as FirebaseFirestore.Timestamp,
			updatedAt: svTime() as FirebaseFirestore.Timestamp,
		};
		try {
			await db.collection('listings').doc(listingData.id).set(newListingData);
		} catch (error) {
			logger.log(error);
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
