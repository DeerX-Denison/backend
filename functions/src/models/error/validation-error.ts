import * as functions from 'firebase-functions';
import { ZodError } from 'zod';

export class ValidationError extends functions.https.HttpsError {
	constructor(error: ZodError) {
		super('invalid-argument', error.message, {
			error,
		});
		this.name = 'ValidationError';
	}
}
