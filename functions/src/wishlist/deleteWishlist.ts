import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { db } from '../firebase.config';
import Logger from '../Logger';
const logger = new Logger();
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
				'Fail to remove listing from wishlist',
				error
			);
		}
		try {
			await db
				.collection('listings')
				.doc(listingId)
				.update({
					savedBy: admin.firestore.FieldValue.increment(-1),
					likedBy: admin.firestore.FieldValue.arrayRemove(context.auth.uid),
				});
		} catch (error) {
			logger.error(`[ERROR 2]: Can't increment listing's savedBy value`);
			logger.error(error);
			return 'error';
		}
		return 'ok';
	}
);

export default deleteWishlist;
