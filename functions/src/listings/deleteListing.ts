import * as functions from 'firebase-functions';
import { db } from '../firebase.config';
import Logger from '../Logger';

const logger = new Logger();

const deleteListing = functions.https.onCall(
	async (listingId: string, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}

		try {
			await db.collection('listings').doc(listingId).delete();
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				'Fail to delete listing',
				error
			);
		}
		return 'ok';
	}
);

export default deleteListing;
