import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { WishlistData } from 'types';
import { db, svTime, Timestamp } from '../firebase.config';
import Logger from '../Logger';
import { getAllSubstrings, isLoggedIn, isNotBanned } from '../utils';
import validWishlistData from './validWishlishData';
const logger = new Logger();
const createWishlist = functions.https.onCall(
	async (wishlistData: WishlistData, context) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);
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
				.doc(invoker.uid)
				.collection('wishlist')
				.doc(wishlistData.id)
				.set(newWishlistData);
			logger.log(`Added to wishlist: ${invoker.uid}/${wishlistData.id}`);
		} catch (error) {
			logger.error(error);
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
					likedBy: admin.firestore.FieldValue.arrayUnion(invoker.uid),
				});
			logger.log(`Updated listing likedBy: ${wishlistData.id}`);
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				`Can't increment listing's savedBy value: ${wishlistData.id}`,
				error
			);
		}

		return 'ok';
	}
);

export default createWishlist;
