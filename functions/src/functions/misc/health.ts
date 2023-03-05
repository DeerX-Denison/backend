import { Firebase } from '../../services/firebase';

export const health = Firebase.functions.https.onCall(() => 'ok');
