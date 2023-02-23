import { HttpsError } from 'firebase-functions/v1/https';
import { ZodError } from 'zod';

export class ValidationError extends HttpsError {
	constructor(error: ZodError) {
		super('invalid-argument', error.message, {
			error,
		});
		this.name = 'ValidationError';
	}
}
