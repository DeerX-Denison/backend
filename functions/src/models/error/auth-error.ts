import * as functions from 'firebase-functions';

export class AuthError extends functions.https.HttpsError {
	/**
	 * creates new AuthError class
	 */
	constructor() {
		super('permission-denied', 'Permission denied');
		this.name = 'AuthError';
	}
}
