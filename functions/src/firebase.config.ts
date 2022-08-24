import * as admin from 'firebase-admin';
import testFunctions from 'firebase-functions-test';
import { default as secrets } from './secrets.json';

const projectConfig = {
	projectId: secrets.projectId,
	storageBucket: secrets.storageBucket,
};

const testEnv = testFunctions(projectConfig);

// testEnv.mockConfig();
// useful for stripe api key testings

const app = admin.initializeApp({
	credential: admin.credential.cert(secrets as admin.ServiceAccount),
});

const db = app.firestore();
const storage = app.storage().bucket(secrets.storageBucket);
const msg = app.messaging();
const svTime = () => admin.firestore.FieldValue.serverTimestamp();

export { app, db, svTime, storage, msg, testEnv };

export type Timestamp = admin.firestore.Timestamp;
