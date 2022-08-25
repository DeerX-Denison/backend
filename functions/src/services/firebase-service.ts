import { app } from '../firebase.config';

const db = app.firestore();

db.settings({ ignoreUndefinedProperties: true });

const storage = app.storage();

export class Firebase {
	public static db = db;
	public static storage = storage;
}
