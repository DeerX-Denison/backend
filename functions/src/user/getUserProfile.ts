import * as functions from 'firebase-functions';
import { ERROR_MESSAGES } from '../constants';
import Logger from '../Logger';
import { fetchUserProfile, isLoggedIn } from '../utils';
const logger = new Logger();

const getUserProfile = functions.https.onCall(
	async (uid: string, context: functions.https.CallableContext) => {
		isLoggedIn(context);
		try {
			return await fetchUserProfile(uid);
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to fetch user profile: ${uid}`);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failGetUserProfile
			);
		}
	}
);
export default getUserProfile;
