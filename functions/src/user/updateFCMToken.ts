import * as functions from 'firebase-functions';
import { db, svTime } from '../firebase.config';
import Logger from '../Logger';
import { isLoggedIn } from '../utils';
const logger = new Logger();

type Data = {
	deviceId: string;
	token: string;
};

const updateFCMToken = functions.https.onCall(
	async (
		{ deviceId, token }: Data,
		context: functions.https.CallableContext
	) => {
		const invokerUid = isLoggedIn(context);

		try {
			await db
				.collection('users')
				.doc(invokerUid)
				.collection('fcm_tokens')
				.doc(deviceId)
				.update({
					token,
					updatedAt: svTime(),
				});
			logger.log(`Updated FCM Token: ${invokerUid}/${deviceId}`);
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				'Fail to update fcm token',
				error
			);
		}
	}
);
export default updateFCMToken;
