import { UserFCMTokenData } from 'types';
import { db } from '../firebase.config';
import Logger from '../Logger';
const logger = new Logger();
/**
 * function to fetch all fcm token of the provided uid
 */
const fetchFCMTokensFromUid = async (uid: string) => {
	try {
		const querySnap = await db
			.collection('users')
			.doc(uid)
			.collection('fcm_tokens')
			.get();
		const tokens: UserFCMTokenData[] = querySnap.docs.map(
			(docSnap) => docSnap.data() as UserFCMTokenData
		);
		return tokens;
	} catch (error) {
		logger.error(`Can't fetch fcm token of uid: ${uid}`);
		throw logger.error(error);
	}
};

export default fetchFCMTokensFromUid;
