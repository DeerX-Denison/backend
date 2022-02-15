import * as functions from 'firebase-functions';
import { ListingData, UserInfo } from 'types';
import { db, svTime } from '../firebase.config';
import { fetchUser } from '../utils';

const updateListing = functions.https.onCall(
	async (listingData: ListingData, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}
		const seller: UserInfo = await fetchUser(listingData.seller.uid);
		const updatedListing = {
			...listingData,
			seller,
			updatedAt: svTime(),
		};
		try {
			await db
				.collection('listings')
				.doc(listingData.id)
				.update(updatedListing);
		} catch (error) {
			throw new functions.https.HttpsError(
				'internal',
				'Fail to update listing',
				error
			);
		}
	}
);

export default updateListing;
