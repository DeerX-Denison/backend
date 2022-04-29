import * as functions from 'firebase-functions';
import { ListingData } from 'types';
import { db } from '../firebase.config';
import Logger from '../Logger';
import { isLoggedIn, isNotBanned } from '../utils';

const logger = new Logger();

const deleteListing = functions.https.onCall(
	async (listingData: ListingData, context) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);

		if (invoker.uid !== listingData.seller.uid) {
			throw new functions.https.HttpsError(
				'permission-denied',
				`Invoker is not listing's seller: ${invokerUid}`
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
