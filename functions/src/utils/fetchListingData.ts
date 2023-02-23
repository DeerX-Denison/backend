import { Firebase } from '../services/firebase';
import { DEFAULT_GUEST_DISPLAY_NAME, DEFAULT_GUEST_EMAIL } from '../constants';
import Logger from '../Logger';
import { ListingData, UserInfo } from '../types';

const logger = new Logger();

export type FetchListingData = (
	listingId: string,
	invoker: UserInfo
) => Promise<ListingData | undefined>;

const fetchListingData: FetchListingData = async (listingId, invoker) => {
	try {
		const collection =
			invoker.displayName === DEFAULT_GUEST_DISPLAY_NAME &&
			invoker.email === DEFAULT_GUEST_EMAIL
				? 'guest_listings'
				: 'listings';
		const docSnap = await Firebase.db
			.collection(collection)
			.doc(listingId)
			.get();
		return docSnap.data() as ListingData;
	} catch (error) {
		logger.error(error);
		logger.error(`Fail to fetch listing data: ${listingId}`);
		return undefined;
	}
};

export default fetchListingData;
