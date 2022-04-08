import { UserProfile } from 'types';
import { db } from '../firebase.config';

export type UserData = {
	searchableKeyword: string[];
} & UserProfile;

/**
 * utility function to fetch user profile from a given uid including pronouns and bio
 */
const fetchUserProfile: (uid: string) => Promise<UserProfile> = async (uid) => {
	const docSnap = await db.collection('users').doc(uid).get();
	if (!docSnap.exists) {
		throw `User not exist: ${uid}`;
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { searchableKeyword, ...userProfile } = docSnap.data() as UserData;
	return userProfile;
};
export default fetchUserProfile;
