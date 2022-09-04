import { app } from '../firebase.config';
import { default as secrets } from '../secrets.json';

const db = app.firestore();

db.settings({ ignoreUndefinedProperties: true });

const storage = app.storage();

const auth = app.auth();

export class Firebase {
	public static db = db;
	public static storage = storage.bucket(secrets.storageBucket);
	public static auth = auth;
}
