import { UserData, UserInfo } from 'types';
import { db } from '../firebase.config';
import Logger from '../Logger';
const logger = new Logger();

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
	const { searchableKeyword, pronouns, bio, ...userInfo } =
		docSnap.data() as UserData;
	return userInfo;
};
export default fetchUserInfo;
