import * as functions from 'firebase-functions';
import { db, svTime } from '../firebase.config';
import Logger from '../Logger';
import { isLoggedIn } from '../utils';
const logger = new Logger();

type Data = {
	deviceId: string;
	token: string;
};
const createFCMToken = functions.https.onCall(
	async ({ deviceId, token }: Data, context) => {
		const invokerUid = isLoggedIn(context);
		try {
			await db
				.collection('users')
				.doc(invokerUid)
				.collection('fcm_tokens')
				.doc(deviceId)
				.set({
					deviceId,
					token,
					updatedAt: svTime(),
				});

			logger.log(`Created FCM Token for user: ${invokerUid}/${deviceId}`);
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
export default createFCMToken;
