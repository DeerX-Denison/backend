import * as functions from 'firebase-functions';

export class ValidationError extends functions.https.HttpsError {
	constructor(field: string, expected: string, got: string, error?: unknown) {
		super('failed-precondition', `${field}: Invalid data type`, {
			expected,
			got,
			error,
		});
		this.name = 'ValidationError';
	}
}
