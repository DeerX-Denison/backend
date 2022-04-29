import * as functions from 'firebase-functions';
import { db, svTime } from '../firebase.config';
import Logger from '../Logger';
import { ListingData, UserInfo } from '../types';
import { isLoggedIn, isNotBanned } from '../utils';

const logger = new Logger();

const createListing = functions.https.onCall(
	async (listingData: ListingData, context) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);

		if (invokerUid !== listingData.seller.uid) {
			throw new functions.https.HttpsError(
				'permission-denied',
				`Invoker is not listing's seller: ${invokerUid}`
			);
		}

		const seller: UserInfo = invoker;
		// create new listing from user input listingData
		const newListingData: ListingData = {
			...listingData,
			seller,
			createdAt: svTime() as FirebaseFirestore.Timestamp,
			updatedAt: svTime() as FirebaseFirestore.Timestamp,
			likedBy: [],
		};

		// update new listing data to db
		try {
			await db.collection('listings').doc(listingData.id).set(newListingData);
			logger.log(`Created listing: ${listingData.id}`);
		} catch (error) {
			throw new functions.https.HttpsError(
				'internal',
				'Fail to create new listing',
				error
			);
		}
		return 'ok';
	}
);

export default createListing;
