import { FirebaseApp, initializeApp } from 'firebase/app';
import {
	getFunctions,
	connectFunctionsEmulator,
	httpsCallable,
} from 'firebase/functions';
import { Environments } from '../models/environments';
import {
	connectAuthEmulator,
	getAuth,
	signInWithEmailAndPassword,
} from 'firebase/auth';

export interface FirebaseClientsOpts {
	environment: Environments;
}

export class FirebaseClient {
	private _app: FirebaseApp;

	private _functions;

	private _auth;

	public functions;

	public signInWithEmailAndPassword;

	constructor(opts: FirebaseClientsOpts) {
		this._app = initializeApp({
			apiKey: 'AIzaSyDn01yATq7oWgrRNp6zJWZUOE2IUZX0w1k',
			authDomain: 'deerx-dev.firebaseapp.com',
			projectId: 'deerx-dev',
			storageBucket: 'deerx-dev.appspot.com',
			messagingSenderId: '674052514669',
			appId: '1:674052514669:web:456334a83578ca64423064',
			measurementId: 'G-6BMY1HVC4J',
		});
		// init functions
		this._functions = getFunctions(this._app, 'us-central1');
		this.functions = (functionName: string) =>
			httpsCallable(this._functions, functionName);

		// init auth
		this._auth = getAuth(this._app);
		this.signInWithEmailAndPassword = (email: string, password: string) =>
			signInWithEmailAndPassword(this._auth, email, password);

		// connect to emulators
		if (opts.environment === Environments.development) {
			connectFunctionsEmulator(this._functions, 'localhost', 5001);
			connectAuthEmulator(this._auth, 'http://localhost:9099', {
				disableWarnings: true,
			});
		}
	}
}
