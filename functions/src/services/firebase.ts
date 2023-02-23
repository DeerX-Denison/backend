import * as functions from 'firebase-functions';
import { initializeApp, cert } from 'firebase-admin/app';
import secrets from '../secrets.json';
import testFunctions from 'firebase-functions-test';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';
import { Timestamp } from '../models/timestamp';

const projectConfig = {
	projectId: secrets.projectId,
	storageBucket: secrets.storageBucket,
};

const testEnv = testFunctions(projectConfig);

const app = initializeApp({
	credential: cert(secrets),
});

const db = getFirestore(app);

db.settings({ ignoreUndefinedProperties: true });

const storage = getStorage(app);

const auth = getAuth(app);

const msg = getMessaging(app);
export class Firebase {
	public static db = db;
	public static storage = storage.bucket(secrets.storageBucket);
	public static auth = auth;
	public static msg = msg;
	public static functions = functions;
	public static testEnv = testEnv;
	public static serverTime = FieldValue.serverTimestamp;
	public static localTime = Timestamp.now;
	public static arrayUnion = FieldValue.arrayUnion;
	public static arrayRemove = FieldValue.arrayRemove;
}
