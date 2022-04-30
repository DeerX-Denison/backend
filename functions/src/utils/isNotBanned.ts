import * as functions from 'firebase-functions';
import { UserInfo } from 'types';
import { ERROR_MESSAGES } from '../constants';
import Logger from '../Logger';
import fetchUserInfo from './fetchUserInfo';

const logger = new Logger();

export type IsNotBanned = (uid: string) => Promise<UserInfo>;

const isNotBanned: IsNotBanned = async (uid) => {
	const invoker = await fetchUserInfo(uid);
	if ('disabled' in invoker && invoker.disabled === true) {
		logger.log(`Invoker account is disabled: ${invoker.uid}`);
		throw new functions.https.HttpsError(
			'permission-denied',
			ERROR_MESSAGES.bannedUser
		);
	}
	return invoker;
};

export default isNotBanned;
