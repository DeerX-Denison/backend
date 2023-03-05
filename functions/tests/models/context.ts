import { FirebaseClient } from '../service/firebase-client';

export interface Context {
	firebase: FirebaseClient;
	debug?: boolean | null;
}
