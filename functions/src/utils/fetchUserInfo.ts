import { UserInfo } from 'types';
import { db } from '../firebase.config';
import Logger from '../Logger';
const logger = new Logger();

export type UserData = {
	searchableKeyword: string[];
} & UserInfo;

/**
 * utility function to fetch user info from a given uid, excluding pronouns and bio
 */
const fetchUserInfo: (uid: string) => Promise<UserInfo> = async (uid) => {
	const docSnap = await db.collection('users').doc(uid).get();
	if (!docSnap.exists) {
		throw `User not exist: ${uid}`;
	}
	logger.log(`Fetched user info: ${uid}`);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { searchableKeyword, ...userInfo } = docSnap.data() as UserData;
	return userInfo;
};
export default fetchUserInfo;
