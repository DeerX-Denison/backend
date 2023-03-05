import { UserData, UserProfile } from 'types';
import { ERROR_MESSAGES } from '../constants';
import Logger from '../Logger';
import { Firebase } from '../services/firebase';

const logger = new Logger();

/**
 * utility function to fetch user profile from a given uid including pronouns and bio
 */
const fetchUserProfile: (uid: string) => Promise<UserProfile> = async (uid) => {
	let docSnap: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>;
	try {
		docSnap = await Firebase.db.collection('users').doc(uid).get();
	} catch (error) {
		logger.log(`Fail to fetch user profile: ${uid}`);
		throw new Firebase.functions.https.HttpsError(
			'internal',
			ERROR_MESSAGES.failGetUserProfile
		);
	}

	if (!docSnap.exists) {
		logger.log(`User not exist: ${uid}`);
		throw new Firebase.functions.https.HttpsError(
			'not-found',
			ERROR_MESSAGES.failGetUserProfile
		);
	}
	logger.log(`Fetched user profile: ${uid}`);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { searchableKeyword, ...userProfile } = docSnap.data() as UserData;
	return userProfile;
};
export default fetchUserProfile;
