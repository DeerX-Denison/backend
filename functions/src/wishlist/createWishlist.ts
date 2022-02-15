import * as functions from 'firebase-functions';
import { WishlistDataCL, WishlistDataSV } from 'types';
import { db, svTime, Timestamp } from '../firebase.config';

const createWishlist = functions.https.onCall(
	async (wishlistData: WishlistDataCL, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}
		try {
			const newWishlistData: WishlistDataSV = {
				...wishlistData,
				addedAt: svTime() as Timestamp,
			};
			await db
				.collection('users')
				.doc(context.auth.uid)
				.collection('wishlist')
				.doc(wishlistData.id)
				.set(newWishlistData);
		} catch (error) {
			throw new functions.https.HttpsError(
				'internal',
				'Fail to add listing to wishlist',
				error
			);
		}
	}
);

export default createWishlist;
