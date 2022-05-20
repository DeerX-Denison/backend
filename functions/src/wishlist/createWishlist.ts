import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { WishlistData } from 'types';
import {
	DEFAULT_GUEST_DISPLAY_NAME,
	DEFAULT_GUEST_EMAIL,
	ERROR_MESSAGES,
} from '../constants';
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
			logger.log(
				`Invalid wishlist data provided: ${JSON.stringify(wishlistData)}`
			);
			throw new functions.https.HttpsError(
				'invalid-argument',
				ERROR_MESSAGES.invalidInput
			);
		}

		const searchableKeyword = getAllSubstrings(wishlistData.name);
		const batch = db.batch();
		const newWishlistData: WishlistData = {
			...wishlistData,
			addedAt: svTime() as Timestamp,
			searchableKeyword,
		};
		batch.set(
			db
				.collection('users')
				.doc(invoker.uid)
				.collection('wishlist')
				.doc(wishlistData.id),
			newWishlistData
		);
		const collection =
			invoker.displayName === DEFAULT_GUEST_DISPLAY_NAME &&
			invoker.email === DEFAULT_GUEST_EMAIL
				? 'guest_listings'
				: 'listings';
		batch.update(db.collection(collection).doc(wishlistData.id), {
			likedBy: admin.firestore.FieldValue.arrayUnion(invoker.uid),
		});
		try {
			await batch.commit();
			logger.log(`Add listing to wishlist: ${invoker.uid}/${wishlistData.id}`);
			logger.log(`Add to listing's likedBy array: ${wishlistData.id}`);
		} catch (error) {
			logger.error(error);
			logger.error(
				`Fail to add listing to wishlist or add to listing's likedBy array: ${invoker.uid}/${wishlistData.id}`
			);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failAddWishlist
			);
		}
		return 'ok';
	}
);

export default createWishlist;
