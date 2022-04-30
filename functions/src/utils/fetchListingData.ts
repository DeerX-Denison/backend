import { db } from '../firebase.config';
import Logger from '../Logger';
import { ListingData } from '../types';
const logger = new Logger();

export type FetchListingData = (
	listingId: string
) => Promise<ListingData | undefined>;

const fetchListingData = async (listingId: string) => {
	try {
		const docSnap = await db.collection('listings').doc(listingId).get();
		if (!docSnap.exists) {
			logger.log(`Listing does not exist: ${listingId}`);
			return undefined;
		}
		const listingData = docSnap.data() as ListingData;
		return listingData;
	} catch (error) {
		logger.error(error);
		return undefined;
	}
};

export default fetchListingData;
