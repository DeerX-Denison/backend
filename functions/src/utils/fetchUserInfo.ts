import * as functions from 'firebase-functions';
import { UserData, UserInfo } from 'types';
import { ERROR_MESSAGES } from '../constants';
import { db } from '../firebase.config';
import Logger from '../Logger';
const logger = new Logger();

/**
 * utility function to fetch user info from a given uid, excluding pronouns and bio
 */
const fetchUserInfo: (uid: string) => Promise<UserInfo> = async (uid) => {
	let docSnap: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>;
	try {
		docSnap = await db.collection('users').doc(uid).get();
	} catch (error) {
		logger.log(`Fail to fetch user info: ${uid}`);
		throw new functions.https.HttpsError(
			'internal',
			ERROR_MESSAGES.failGetUserProfile
		);
	}

	if (!docSnap.exists) {
		logger.log(`User not exist: ${uid}`);
		throw new functions.https.HttpsError(
			'not-found',
			ERROR_MESSAGES.failGetUserProfile
		);
	}

	logger.log(`Fetched user info: ${uid}`);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { searchableKeyword, pronouns, bio, ...userInfo } =
		docSnap.data() as UserData;
	return userInfo;
};
export default fetchUserInfo;
