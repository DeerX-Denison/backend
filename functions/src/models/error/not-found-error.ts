import * as functions from 'firebase-functions';

export class NotFoundError extends functions.https.HttpsError {
	details: unknown;

	constructor(error?: unknown) {
		super('not-found', 'Not found error');
		this.name = 'NotFoundError';
		this.details = error;
	}
}
