import { UserInfo } from 'types';
import { db } from '../firebase.config';

export type UserData = {
	searchableKeyword: string[];
} & UserInfo;

/**
 * utility function to fetch user info from a given uid
 */
const fetchUser: (uid: string) => Promise<UserInfo> = async (uid) => {
	console.log('fetching user');

	const docSnap = await db.collection('users').doc(uid).get();
	if (!docSnap.exists) {
		throw `User not exist: ${uid}`;
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { searchableKeyword, ...userInfo } = docSnap.data() as UserData;
	return userInfo;
};
export default fetchUser;
