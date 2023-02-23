import { FirebaseClient } from '../service/firebase-client';

export interface Context {
	firebaseClient: FirebaseClient;
	debug?: boolean | null;
}
