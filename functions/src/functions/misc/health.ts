import * as functions from 'firebase-functions';

export const health = functions.https.onCall(() => 'ok');
