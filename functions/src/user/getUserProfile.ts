import * as functions from 'firebase-functions';
import { fetchUserProfile } from '../utils';

const getUserProfile = functions.https.onCall(async (uid: string, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError(
			'unauthenticated',
			'User unauthenticated'
		);
	}
	try {
		return await fetchUserProfile(uid);
	} catch (error) {
		throw new functions.https.HttpsError(
			'internal',
			`Fail to fetch user profile: ${uid}`,
			error
		);
	}
});
export default getUserProfile;
