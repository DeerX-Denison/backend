import { HttpsError } from 'firebase-functions/v1/https';

export class InternalError extends HttpsError {
	details: unknown;

	constructor(error?: unknown) {
		super('internal', 'Internal server error');
		this.name = 'InternalError';
		this.details = error;
	}
}
