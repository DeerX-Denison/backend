import * as functions from 'firebase-functions';

export class InternalError extends functions.https.HttpsError {
	details: unknown;

	constructor(error?: unknown) {
		super('internal', 'Internal server error');
		this.name = 'InternalError';
		this.details = error;
	}
}
