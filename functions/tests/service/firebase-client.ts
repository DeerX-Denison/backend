import { getApp, FirebaseApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { Environments } from '../models/environments';

export interface FirebaseClientsOpts {
	environment: Environments;
}

export class FirebaseClient {
	private app: FirebaseApp;
	public functions;
	constructor(opts: FirebaseClientsOpts) {
		this.app = getApp();

		this.functions = getFunctions(this.app);

		if (opts.environment === Environments.development) {
			connectFunctionsEmulator(this.functions, 'localhost', 5001);
		}
	}
}
