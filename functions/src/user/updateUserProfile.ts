import * as functions from 'firebase-functions';
import { UserProfile } from 'types';
import { db } from '../firebase.config';
const updateUserProfile = functions.https.onCall(
	async (userProfile: UserProfile, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}

		try {
			await db.collection('users').doc(context.auth.uid).update({
				photoURL: userProfile.photoURL,
				bio: userProfile.bio,
				pronouns: userProfile.pronouns,
			});
		} catch (error) {
			throw new functions.https.HttpsError(
				'internal',
				'Fail to update user photoURL',
				error
			);
		}
	}
);
export default updateUserProfile;
