import * as functions from 'firebase-functions';
import { db } from '../firebase.config';
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
		} catch (error) {
			throw new functions.https.HttpsError(
				'internal',
				'Fail to create new fcm token',
				error
			);
		}
	}
);
export default deleteFCMToken;
