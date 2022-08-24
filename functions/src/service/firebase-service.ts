import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { app } from '../firebase.config';

const db = app.firestore();

db.settings({ ignoreUndefinedProperties: true });

const storage = app.storage();

const messaging = app.messaging();

const auth = app.auth();

export const Firebase = {
	functions,
	db,
	storage,
	messaging,
	auth,
	increment: admin.firestore.FieldValue.increment,
	arrayUnion: admin.firestore.FieldValue.arrayUnion,
	arrayRemove: admin.firestore.FieldValue.arrayRemove,
};
