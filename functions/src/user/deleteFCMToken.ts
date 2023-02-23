import { Firebase } from '../services/firebase-service';
import Logger from '../Logger';
const logger = new Logger();

type Data = {
	deviceId: string;
	uid: string;
};
const deleteFCMToken = Firebase.functions.https.onCall(
	async ({ deviceId, uid }: Data) => {
		try {
			await Firebase.db
				.collection('users')
				.doc(uid)
				.collection('fcm_tokens')
				.doc(deviceId)
				.delete();
			logger.log(`Deleted FCM Token: ${uid}/${deviceId}`);
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to delete FCM Token: ${uid}/${deviceId}`);
		}
	}
);
export default deleteFCMToken;
