import * as functions from 'firebase-functions';
import { ERROR_MESSAGES } from '../constants';
import Logger from '../Logger';

const logger = new Logger();

export type IsLoggedIn = (context: functions.https.CallableContext) => string;

const isLoggedIn: IsLoggedIn = (context) => {
	if (!context.auth) {
		logger.log(`User unauthenticated`);
		throw new functions.https.HttpsError(
			'unauthenticated',
			ERROR_MESSAGES.unauthenticated
		);
	}
	return context.auth.uid;
};

export default isLoggedIn;
