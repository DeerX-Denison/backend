import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { UserPronoun } from 'types';
import { db } from '../firebase.config';
import Logger from '../Logger';
const logger = new Logger();

type Data = {
	imageUrl: string | undefined;
	bio: string | undefined;
	pronouns: UserPronoun[] | undefined;
};

const updateUserProfile = functions.https.onCall(
	async ({ imageUrl, bio, pronouns }: Data, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}

		const updateValue: { [key: string]: string | UserPronoun[] } = {};
		if (imageUrl) updateValue['photoURL'] = imageUrl;
		if (bio) updateValue['bio'] = bio;
		if (pronouns) updateValue['pronouns'] = pronouns;

		try {
			await db.collection('users').doc(context.auth.uid).update(updateValue);
			logger.log(`Updated user profile in database: ${context.auth.uid}`);
			if (imageUrl) {
				await admin.auth().updateUser(context.auth.uid, { photoURL: imageUrl });
				logger.log(`Updated user profile in firebase: ${context.auth.uid}`);
			}
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				'Fail to update user photoURL',
				error
			);
		}
	}
);
export default updateUserProfile;
