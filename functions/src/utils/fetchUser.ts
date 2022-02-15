import { UserInfo } from 'types';
import { db } from '../firebase.config';
/**
 * utility function to fetch user info from a given uid
 */
const fetchUser: (uid: string) => Promise<UserInfo> = async (uid) => {
	console.log('fetching user');

	const docSnap = await db.collection('users').doc(uid).get();
	if (!docSnap.exists) {
		throw `User not exist: ${uid}`;
	}
	const userInfo = docSnap.data() as UserInfo;
	return userInfo;
};
export default fetchUser;
