import { UserPronoun } from 'types';
import { ERROR_MESSAGES } from '../constants';
import Logger from '../Logger';
import { isLoggedIn, isNotBanned } from '../utils';
import { Firebase } from '../services/firebase';

const logger = new Logger();

type Data = {
	imageUrl: string | undefined;
	bio: string | undefined;
	pronouns: UserPronoun[] | undefined;
};

const updateUserProfile = Firebase.functions.https.onCall(
	async ({ imageUrl, bio, pronouns }: Data, context) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);
		const updateValue: { [key: string]: string | UserPronoun[] } = {};
		if (imageUrl) updateValue['photoURL'] = imageUrl;
		if (bio) updateValue['bio'] = bio;
		if (pronouns) updateValue['pronouns'] = pronouns;

		try {
			await Firebase.db
				.collection('users')
				.doc(invoker.uid)
				.update(updateValue);
			logger.log(`Updated user profile in database: ${invoker.uid}`);
			if (imageUrl) {
				await Firebase.auth.updateUser(invoker.uid, { photoURL: imageUrl });
				logger.log(`Updated user profile in firebase: ${invoker.uid}`);
			}
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to update user profile: ${invoker.uid}`);
			throw new Firebase.functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failUpdateUserProfile
			);
		}
	}
);
export default updateUserProfile;
