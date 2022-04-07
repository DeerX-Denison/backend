import * as functions from 'firebase-functions';
import { db } from '../firebase.config';
const updateUserPhoto = functions.https.onCall(async (imageUrl, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError(
			'unauthenticated',
			'User unauthenticated'
		);
	}
	try {
		await db
			.collection('users')
			.doc(context.auth.uid)
			.update({ photoURL: imageUrl });
	} catch (error) {
		throw new functions.https.HttpsError(
			'internal',
			'Fail to update user photoURL',
			error
		);
	}
});
export default updateUserPhoto;
