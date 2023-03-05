import { WishlistData } from 'types';
import {
	DEFAULT_GUEST_DISPLAY_NAME,
	DEFAULT_GUEST_EMAIL,
	ERROR_MESSAGES,
} from '../constants';
import Logger from '../Logger';
import { getAllSubstrings, isLoggedIn, isNotBanned } from '../utils';
import validWishlistData from './validWishlishData';
import { Firebase } from '../services/firebase';
import { Timestamp } from '../models/timestamp';

const logger = new Logger();

const createWishlist = Firebase.functions.https.onCall(
	async (wishlistData: WishlistData, context) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);

		wishlistData['searchableKeyword'] = getAllSubstrings(wishlistData.name);
		if (!validWishlistData(wishlistData)) {
			logger.log(
				`Invalid wishlist data provided: ${JSON.stringify(wishlistData)}`
			);
			throw new Firebase.functions.https.HttpsError(
				'invalid-argument',
				ERROR_MESSAGES.invalidInput
			);
		}

		const searchableKeyword = getAllSubstrings(wishlistData.name);
		const batch = Firebase.db.batch();
		const newWishlistData: WishlistData = {
			...wishlistData,
			addedAt: Firebase.serverTime() as Timestamp,
			searchableKeyword,
		};
		batch.set(
			Firebase.db
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
		batch.update(Firebase.db.collection(collection).doc(wishlistData.id), {
			likedBy: Firebase.arrayUnion(invoker.uid),
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
			throw new Firebase.functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failAddWishlist
			);
		}
		return 'ok';
	}
);

export default createWishlist;
