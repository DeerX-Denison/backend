import * as functions from 'firebase-functions';
import { ERROR_MESSAGES } from '../constants';
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
			logger.log(`Invoker is not listing's owner: ${invokerUid}`);
			throw new functions.https.HttpsError(
				'permission-denied',
				ERROR_MESSAGES.notListingOwner
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
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failCreateListing
			);
		}
		return 'ok';
	}
);

export default createListing;
