import * as functions from 'firebase-functions';
import { fetchUserProfile, isLoggedIn } from '../utils';

const getUserProfile = functions.https.onCall(
	async (uid: string, context: functions.https.CallableContext) => {
		isLoggedIn(context);
		try {
			return await fetchUserProfile(uid);
		} catch (error) {
			throw new functions.https.HttpsError(
				'internal',
				`Fail to fetch user profile: ${uid}`,
				error
			);
		}
	}
);
export default getUserProfile;
