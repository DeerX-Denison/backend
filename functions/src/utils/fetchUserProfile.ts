import { UserData, UserProfile } from 'types';
import { db } from '../firebase.config';
import Logger from '../Logger';
const logger = new Logger();

/**
 * utility function to fetch user profile from a given uid including pronouns and bio
 */
const fetchUserProfile: (uid: string) => Promise<UserProfile> = async (uid) => {
	const docSnap = await db.collection('users').doc(uid).get();
	if (!docSnap.exists) {
		throw `User not exist: ${uid}`;
	}
	logger.log(`Fetched user profile: ${uid}`);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { searchableKeyword, ...userProfile } = docSnap.data() as UserData;
	return userProfile;
};
export default fetchUserProfile;
