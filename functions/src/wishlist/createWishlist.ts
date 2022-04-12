import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { WishlistData } from 'types';
import { db, svTime, Timestamp } from '../firebase.config';
import Logger from '../Logger';
import { getAllSubstrings } from '../utils';
import validWishlistData from './validWishlishData';
const logger = new Logger();
const createWishlist = functions.https.onCall(
	async (wishlistData: WishlistData, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}
		wishlistData['searchableKeyword'] = getAllSubstrings(wishlistData.name);
		if (!validWishlistData(wishlistData)) {
			throw new functions.https.HttpsError(
				'invalid-argument',
				'invalid wishlist data provided'
			);
		}

		const searchableKeyword = getAllSubstrings(wishlistData.name);
		try {
			const newWishlistData: WishlistData = {
				...wishlistData,
				addedAt: svTime() as Timestamp,
				searchableKeyword,
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

		try {
			await db
				.collection('listings')
				.doc(wishlistData.id)
				.update({
					likedBy: admin.firestore.FieldValue.arrayUnion(context.auth.uid),
				});
		} catch (error) {
			logger.error(`[ERROR 2]: Can't increment listing's savedBy value`);
			logger.error(error);
			return 'error';
		}

		return 'ok';
	}
);

export default createWishlist;
