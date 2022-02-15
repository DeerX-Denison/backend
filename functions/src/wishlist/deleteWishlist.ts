import * as functions from 'firebase-functions';
import { db } from '../firebase.config';

const deleteWishlist = functions.https.onCall(
	async (listingId: string, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}
		try {
			await db
				.collection('users')
				.doc(context.auth.uid)
				.collection('wishlist')
				.doc(listingId)
				.delete();
		} catch (error) {
			throw new functions.https.HttpsError(
				'internal',
				'Fail to add listing to wishlist',
				error
			);
		}
	}
);

export default deleteWishlist;
