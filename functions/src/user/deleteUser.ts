import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { ERROR_MESSAGES } from '../constants';
import { db } from '../firebase.config';
import Logger from '../Logger';
import { isLoggedIn, isNotBanned } from '../utils';

const logger = new Logger();

const deleteUser = functions.https.onCall(
	async (_data, context: functions.https.CallableContext) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);

		try {
			await admin.auth().deleteUser(invoker.uid);
			logger.log(`Deleted user from auth: ${invoker.uid}`);
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to delete anonymous user from auth: ${invoker.uid}`);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failDeleteAnonUser
			);
		}

		try {
			await admin
				.firestore()
				.recursiveDelete(db.collection('users').doc(invoker.uid));
			logger.log(`Recursively deleted member id ${invoker.uid}`);
		} catch (error) {
			logger.error(error);
			logger.error(
				`Fail to recursively delete anonymous user from db: ${invoker.uid}`
			);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failDeleteAnonUser
			);
		}
	}
);

export default deleteUser;
