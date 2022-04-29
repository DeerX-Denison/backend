import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { db } from '../firebase.config';
import Logger from '../Logger';
import { isLoggedIn, isNotBanned } from '../utils';
const logger = new Logger();
const deleteWishlist = functions.https.onCall(
	async (listingId: string, context) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);
		try {
			await db
				.collection('users')
				.doc(invoker.uid)
				.collection('wishlist')
				.doc(listingId)
				.delete();
			logger.log(`Removed to wishlist: ${invoker.uid}/${listingId}`);
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				'Fail to remove listing from wishlist',
				error
			);
		}
		try {
			await db
				.collection('listings')
				.doc(listingId)
				.update({
					likedBy: admin.firestore.FieldValue.arrayRemove(invoker.uid),
				});
			logger.log(`Updated listing likedBy: ${listingId}`);
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				`Can't decrement listing's savedBy value: ${listingId}`,
				error
			);
		}
		return 'ok';
	}
);

export default deleteWishlist;
