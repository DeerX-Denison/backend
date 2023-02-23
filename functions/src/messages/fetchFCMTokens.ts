import { UserFCMTokenData } from 'types';
import Logger from '../Logger';
import { Firebase } from '../services/firebase';
const logger = new Logger();
/**
 * function to fetch all fcm token of the provided uid
 */
const fetchFCMTokensFromUid = async (uid: string) => {
	try {
		const querySnap = await Firebase.db
			.collection('users')
			.doc(uid)
			.collection('fcm_tokens')
			.get();
		logger.log(`Fetched FCM tokens of user: ${uid}`);
		if (querySnap.empty) return [];
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
