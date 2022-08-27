import {
	VALID_CATEGORIES,
	VALID_CONDITIONS,
	VALID_STATUSES,
} from '../constants';
import { ListingData } from '../types';

/**
 * check if input listingData has valid type for its key
 * Check if listingData has valid data type. if not, delete the document. This is to prevent malicious user from abusing firestore REST API to programatically create document. Data created/updated from the app by normal user should be valid.
 */
const validType: (listingData: ListingData) => boolean = (listingData) => {
	// valid id
	if (typeof listingData.id !== 'string') return false;

	// valid image array
	if (typeof listingData.images !== 'object') return false;
	if (!Array.isArray(listingData.images)) return false;
	for (let i = 0; i < listingData.images.length; i++) {
		if (typeof listingData.images[i] !== 'string') return false;
		if (!listingData.images[i].startsWith('http')) return false;
		if (
			!(
				listingData.images[i].includes('.jpg') ||
				listingData.images[i].includes('.jpeg') ||
				listingData.images[i].includes('.png') ||
				listingData.images[i].includes('.heif') ||
				listingData.images[i].includes('.heic')
			)
		)
			return false;
	}
	if (listingData.images.length > 5) return false;

	// valid name
	if (typeof listingData.name !== 'string') return false;

	// valid price
	if (typeof listingData.price !== 'string') return false;
	if (isNaN(parseFloat(listingData.price))) return false;

	const validCategories = VALID_CATEGORIES;
	if (typeof listingData.category !== 'object') return false;
	if (!Array.isArray(listingData.category)) return false;
	for (let i = 0; i < listingData.category.length; i++) {
		const category = listingData.category[i];
		if (!category) return false;
		if (typeof category !== 'string') return false;
		if (!validCategories.includes(category)) return false;
	}

	// valid condition
	if (typeof listingData.condition !== 'string') return false;
	const validConditions = VALID_CONDITIONS;
	if (!validConditions.includes(listingData.condition)) return false;

	// valid seller
	if (typeof listingData.seller !== 'object') return false;
	if (!('uid' in listingData.seller)) return false;
	if (typeof listingData.seller.uid !== 'string') return false;

	// valid description
	if (typeof listingData.description !== 'string') return false;

	// valid likedBy
	if (typeof listingData.likedBy !== 'object') return false;
	if (!Array.isArray(listingData.likedBy)) return false;
	for (let i = 0; i < listingData.likedBy.length; i++) {
		if (typeof listingData.likedBy[i] !== 'string') return false;
	}

	// valid status
	const validStatuses = VALID_STATUSES;
	if (!validStatuses.includes(listingData.status)) return false;
	return true;
};

/**
 * preconditions: pass validType checks
 * check if input listingData has valid data logic
 * This is to prevent malicious user from abusing firestore REST API to programatically manipulate db. Date created/updated from the app by normal user should be valid
 */
const validData: (listingData: ListingData) => boolean = (listingData) => {
	// if status is sold, "soldTo" must be in listingData and must be truthy
	if (listingData.status === 'sold') {
		if (!('soldTo' in listingData) || !listingData.soldTo) {
			return false;
		}
	} else {
		// intentionally not implement to check:
		// if listingData.status is not "sold", expect key "soldTo" not be in listingData
		// reason: design decision: when user update a listing from "sold" to "posted" or "saved", soldTo will still be there, and only removed in the format listing data stage.
	}

	return true;
};
/**
 * check if input data is valid
 */
const validListingData: (listingData: ListingData) => boolean = (
	listingData
) => {
	if (!validType(listingData)) return false;
	if (!validData(listingData)) return false;
	return true;
};
export default validListingData;
