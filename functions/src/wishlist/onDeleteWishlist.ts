// import * as admin from 'firebase-admin';
// import * as functions from 'firebase-functions';
// import { WishlistData } from 'types';
// import { db } from '../firebase.config';
// import Logger from '../Logger';
// import validWishlistData from './validWishlishData';

// const logger = new Logger();

// const onDeleteWishlist = functions.firestore
// 	.document('users/{userId}/wishlist/{listingId}')
// 	.onDelete(
// 		async (
// 			snapshot: functions.firestore.QueryDocumentSnapshot,
// 			context: functions.EventContext
// 		) => {
// 			if (!snapshot.exists) {
// 				return logger.error(
// 					`[ERROR 0]: Document snapshot that triggers onCreate does not exist: ${snapshot.id}`
// 				);
// 			}

// 			const wishlist = snapshot.data() as WishlistData;
// 			const { userId, listingId } = context.params;

// 			// validate data
// 			if (!validWishlistData(wishlist, userId, listingId)) {
// 				try {
// 					await snapshot.ref.delete();
// 				} catch (error) {
// 					logger.error(
// 						`[ERROR 1]: Can't delete document when listing data is invalid: ${snapshot.id}`
// 					);
// 					logger.error(error);
// 					return 'error';
// 				}
// 			}

// 			// decrement the listing savedBy value
// 			try {
// 				await db
// 					.collection('listings')
// 					.doc(listingId)
// 					.update({ savedBy: admin.firestore.FieldValue.increment(-1) });
// 			} catch (error) {
// 				logger.error(`[ERROR 2]: Can't decrement listing's savedBy value`);
// 				logger.error(error);
// 				return 'error';
// 			}
// 		}
// 	);

// export default onDeleteWishlist;
