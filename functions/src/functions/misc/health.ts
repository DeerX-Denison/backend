import * as functions from 'firebase-functions';
import { ConfirmationResponse } from 'models/responses/confirmation-response';

export const health = functions.https.onCall(() => {
	return new ConfirmationResponse().toJSON();
});
