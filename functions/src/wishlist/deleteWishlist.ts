import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {
	DEFAULT_GUEST_DISPLAY_NAME,
	DEFAULT_GUEST_EMAIL,
	ERROR_MESSAGES,
} from '../constants';
import { db } from '../firebase.config';
import Logger from '../Logger';
import { isLoggedIn, isNotBanned } from '../utils';
const logger = new Logger();
const deleteWishlist = functions.https.onCall(
	async (listingId: string, context) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);

		const batch = db.batch();

		batch.delete(
			db
				.collection('users')
				.doc(invoker.uid)
				.collection('wishlist')
				.doc(listingId)
		);

		const collection =
			invoker.displayName === DEFAULT_GUEST_DISPLAY_NAME &&
			invoker.email === DEFAULT_GUEST_EMAIL
				? 'guest_listings'
				: 'listings';
		batch.update(db.collection(collection).doc(listingId), {
			likedBy: admin.firestore.FieldValue.arrayUnion(invoker.uid),
		});
		try {
			await batch.commit();
			logger.log(`Remove listing from wishlist: ${invoker.uid}/${listingId}`);
			logger.log(`Remove from listing's likedBy array: ${listingId}`);
		} catch (error) {
			logger.error(error);
			logger.error(
				`Fail to remove listing from wishlist or remove from listing's likedBy array: ${invoker.uid}/${listingId}`
			);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failAddWishlist
			);
		}
		return 'ok';
	}
);

export default deleteWishlist;
