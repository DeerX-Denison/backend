import { Firebase } from '../../services/firebase-service';

export const health = Firebase.functions.https.onCall(() => 'ok');
