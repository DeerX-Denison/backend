import * as functions from 'firebase-functions';
import { ListingData } from 'types';
import { db } from '../firebase.config';
import Logger from '../Logger';

const logger = new Logger();

const deleteListing = functions.https.onCall(
	async (listingData: ListingData, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}

		if (context.auth.uid !== listingData.seller.uid) {
			throw new functions.https.HttpsError(
				'permission-denied',
				`Invoker is not listing's seller: ${context.auth.uid}`
			);
		}

		try {
			await db.collection('listings').doc(listingData.id).delete();
			logger.log(`Deleted listing: ${listingData.id}`);
		} catch (error) {
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
