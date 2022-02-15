import * as functions from 'firebase-functions';
import { db, svTime } from '../firebase.config';
type Data = {
	deviceId: string;
	token: string;
};
const updateFCMToken = functions.https.onCall(
	async ({ deviceId, token }: Data, context) => {
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
				.collection('fcm_tokens')
				.doc(deviceId)
				.update({
					token,
					updatedAt: svTime(),
				});
		} catch (error) {
			throw new functions.https.HttpsError(
				'internal',
				'Fail to update fcm token',
				error
			);
		}
	}
);
export default updateFCMToken;
