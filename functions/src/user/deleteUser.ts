import { ERROR_MESSAGES } from '../constants';
import Logger from '../Logger';
import { isLoggedIn, isNotBanned } from '../utils';
import { Firebase } from '../services/firebase-service';

const logger = new Logger();

const deleteUser = Firebase.functions.https.onCall(async (_data, context) => {
	const invokerUid = isLoggedIn(context);
	const invoker = await isNotBanned(invokerUid);

	try {
		await Firebase.auth.deleteUser(invoker.uid);
		logger.log(`Deleted user from auth: ${invoker.uid}`);
	} catch (error) {
		logger.error(error);
		logger.error(`Fail to delete anonymous user from auth: ${invoker.uid}`);
		throw new Firebase.functions.https.HttpsError(
			'internal',
			ERROR_MESSAGES.failDeleteAnonUser
		);
	}

	try {
		await Firebase.db.recursiveDelete(
			Firebase.db.collection('users').doc(invoker.uid)
		);
		logger.log(`Recursively deleted member id ${invoker.uid}`);
	} catch (error) {
		logger.error(error);
		logger.error(
			`Fail to recursively delete anonymous user from db: ${invoker.uid}`
		);
		throw new Firebase.functions.https.HttpsError(
			'internal',
			ERROR_MESSAGES.failDeleteAnonUser
		);
	}
});

export default deleteUser;
