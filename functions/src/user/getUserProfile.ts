import { UserProfile } from 'types';
import { CORE_TEAM_EMAILS, ERROR_MESSAGES } from '../constants';
import Logger from '../Logger';
import { fetchUserProfile, isLoggedIn } from '../utils';
import { Firebase } from '../services/firebase';

const logger = new Logger();

const getUserProfile = Firebase.functions.https.onCall(
	async (uid: string, context) => {
		isLoggedIn(context);

		let userProfile: UserProfile;
		try {
			userProfile = await fetchUserProfile(uid);
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to fetch user profile: ${uid}`);
			throw new Firebase.functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failGetUserProfile
			);
		}

		if (context.auth?.token.firebase.sign_in_provider === 'anonymous') {
			if ('email' in userProfile && userProfile.email) {
				if (
					!CORE_TEAM_EMAILS.includes(userProfile.email) &&
					context.auth.uid !== userProfile.uid
				) {
					logger.log(
						`Anonymous user (${context.auth.uid}) attempt to fetch: ${uid}`
					);
					throw new Firebase.functions.https.HttpsError(
						'internal',
						ERROR_MESSAGES.noPermGuest
					);
				}
			}
		}
		return userProfile;
	}
);
export default getUserProfile;
