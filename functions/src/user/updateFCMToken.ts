import { Firebase } from '../services/firebase';
import Logger from '../Logger';
import { isLoggedIn } from '../utils';
const logger = new Logger();

type Data = {
	deviceId: string;
	token: string;
};

const updateFCMToken = Firebase.functions.https.onCall(
	async ({ deviceId, token }: Data, context) => {
		const invokerUid = isLoggedIn(context);

		try {
			await Firebase.db
				.collection('users')
				.doc(invokerUid)
				.collection('fcm_tokens')
				.doc(deviceId)
				.update({
					token,
					updatedAt: Firebase.serverTime(),
				});
			logger.log(`Updated FCM Token: ${invokerUid}/${deviceId}`);
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to update fcm token: ${invokerUid}/${deviceId}`);
			return;
		}
	}
);
export default updateFCMToken;
