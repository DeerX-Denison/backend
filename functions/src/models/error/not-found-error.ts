import { HttpsError } from 'firebase-functions/v1/https';

export class NotFoundError extends HttpsError {
	details: unknown;

	constructor(error?: unknown) {
		super('not-found', 'Not found error');
		this.name = 'NotFoundError';
		this.details = error;
	}
}
