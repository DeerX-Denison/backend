import { app } from '../firebase.config';

const db = app.firestore();

db.settings({ ignoreUndefinedProperties: true });

const storage = app.storage();

const auth = app.auth();

export class Firebase {
	public static db = db;
	public static storage = storage;
	public static auth = auth;
}
