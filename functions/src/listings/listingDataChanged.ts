import { ListingData } from 'types';
import { isDeepStrictEqual } from 'util';

/**
 * boolean function to deep compare 2 old listing data with new listing data, if both data is strict equal, data was not formatted
 */
const listingDataChanged: (
	listingData: ListingData,
	newListingData: ListingData
) => boolean = (listingData, newListingData) => {
	return !isDeepStrictEqual(listingData, newListingData);
};

export default listingDataChanged;
