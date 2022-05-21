import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { ERROR_MESSAGES } from '../constants';
import { db } from '../firebase.config';
import Logger from '../Logger';

const logger = new Logger();
const deleteAnonymousUser = functions.https.onCall(
	async ({ uid }: { uid: string }) => {
		try {
			await admin.auth().deleteUser(uid);
			logger.log(`Deleted user from auth: ${uid}`);
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to delete anonymous user from auth: ${uid}`);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failDeleteAnonUser
			);
		}

		try {
			await admin.firestore().recursiveDelete(db.collection('users').doc(uid));
			logger.log(`Recursively deleted member id ${uid}`);
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to recursively delete anonymous user from db: ${uid}`);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failDeleteAnonUser
			);
		}

		let threadIds: string[];
		try {
			const querySnap = await db
				.collection('threads')
				.where('membersUid', 'array-contains', uid)
				.get();
			threadIds = querySnap.docs.map((x) => x.id);
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to query threads from db: ${uid}`);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failDeleteAnonUser
			);
		}

		threadIds.forEach(async (threadId) => {
			try {
				await admin
					.firestore()
					.recursiveDelete(db.collection('threads').doc(threadId));
				logger.log(`Recursively deleted thread ids ${threadId}`);
			} catch (error) {
				logger.error(error);
				logger.error(`Fail to recursively delete thread from db: ${threadId}`);
			}
		});

		let listingIds: string[];
		try {
			const querySnap = await db
				.collection('guest_listings')
				.where('seller.uid', '==', uid)
				.get();
			listingIds = querySnap.docs.map((x) => x.id);
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to query guest listings from db: ${uid}`);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failDeleteAnonUser
			);
		}

		const listingBatch = db.batch();
		listingIds.forEach((id) =>
			listingBatch.delete(db.collection('guest_listings').doc(id))
		);

		try {
			await listingBatch.commit();
			logger.log(`Deleted listing ids: [${listingIds.join(', ')}]`);
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to delete queried listings from db: ${uid}`);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failDeleteAnonUser
			);
		}
	}
);

export default deleteAnonymousUser;
