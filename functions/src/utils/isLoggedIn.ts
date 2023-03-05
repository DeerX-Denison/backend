import { CallableContext } from 'firebase-functions/v1/https';
import { ERROR_MESSAGES } from '../constants';
import Logger from '../Logger';
import { Firebase } from '../services/firebase';

const logger = new Logger();

export type IsLoggedIn = (context: CallableContext) => string;

const isLoggedIn: IsLoggedIn = (context) => {
	if (!context.auth) {
		logger.log(`User unauthenticated`);
		throw new Firebase.functions.https.HttpsError(
			'unauthenticated',
			ERROR_MESSAGES.unauthenticated
		);
	}
	return context.auth.uid;
};

export default isLoggedIn;
