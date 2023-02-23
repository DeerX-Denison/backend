import { HttpsError } from 'firebase-functions/v1/https';

export class AuthError extends HttpsError {
	/**
	 * creates new AuthError class
	 */
	constructor() {
		super('permission-denied', 'Permission denied');
		this.name = 'AuthError';
	}
}
