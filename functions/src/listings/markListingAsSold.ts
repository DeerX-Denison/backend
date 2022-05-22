import * as functions from 'firebase-functions';
import {
	DEFAULT_GUEST_DISPLAY_NAME,
	DEFAULT_GUEST_EMAIL,
	ERROR_MESSAGES,
} from '../constants';
import { db } from '../firebase.config';
import Logger from '../Logger';
import { UserInfo } from '../types';
import {
	fetchListingData,
	fetchUserInfo,
	isLoggedIn,
	isNotBanned,
} from '../utils';

const logger = new Logger();

type Data = {
	listingId: string;
	soldToUid: string;
};
const markListingAsSold = functions.https.onCall(
	async (
		{ listingId, soldToUid }: Data,
		context: functions.https.CallableContext
	) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);

		const listingData = await fetchListingData(listingId, invoker);
		if (!listingData) {
			logger.log(`listing data is falsy when fetched: ${listingId}`);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failMarkListingAsSold
			);
		}

		if (invoker.uid !== listingData.seller.uid) {
			logger.log(
				`Non seller (${invoker.uid}) attempt to mark listing as sold: ${listingData.id}`
			);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.notListingOwner
			);
		}

		let soldToInfo: UserInfo;
		try {
			soldToInfo = await fetchUserInfo(soldToUid);
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failMarkListingAsSold
			);
		}

		const collection =
			invoker.displayName === DEFAULT_GUEST_DISPLAY_NAME &&
			invoker.email === DEFAULT_GUEST_EMAIL
				? 'guest_listings'
				: 'listings';

		try {
			await db
				.collection(collection)
				.doc(listingId)
				.update({ status: 'sold', soldTo: soldToInfo });
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failMarkListingAsSold
			);
		}
	}
);

export default markListingAsSold;
