import * as functions from 'firebase-functions';
import { db } from '../firebase.config';
import Logger from '../Logger';
const logger = new Logger();

type Data = {
	deviceId: string;
	uid: string;
};
const deleteFCMToken = functions.https.onCall(
	async ({ deviceId, uid }: Data) => {
		try {
			await db
				.collection('users')
				.doc(uid)
				.collection('fcm_tokens')
				.doc(deviceId)
				.delete();
			logger.log(`Deleted FCM Token: ${uid}/${deviceId}`);
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				'Fail to create new fcm token',
				error
			);
		}
	}
);
export default deleteFCMToken;
