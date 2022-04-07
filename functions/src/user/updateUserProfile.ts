import * as functions from 'firebase-functions';
import { UserPronoun } from 'types';
import { db } from '../firebase.config';

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
