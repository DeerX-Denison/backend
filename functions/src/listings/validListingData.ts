import { ListingData } from 'types';

/**
 * check if input listingData has valid type for its key
 * Check if listingData has valid data. if not, delete the document. This is to prevent malicious user from abusing firestore REST API to programatically create document. Data created/updated from the app by normal user should be valid.
 */
const validType: (ListingData: ListingData) => boolean = (listingData) => {
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

	// valid name
	if (typeof listingData.name !== 'string') return false;

	// valid price
	if (typeof listingData.price !== 'string') return false;
	if (isNaN(parseFloat(listingData.price))) return false;

	const validCategory = [
		'FURNITURE',
		'FASHION',
		'BOOKS',
		'SEASONAL',
		'DORM GOODS',
		'JEWELRIES',
		'ELECTRONIC',
		'INSTRUMENT',
	];
	if (typeof listingData.category !== 'object') return false;
	if (!Array.isArray(listingData.category)) return false;
	for (let i = 0; i < listingData.category.length; i++) {
		const category = listingData.category[i];
		if (!category) return false;
		if (typeof category !== 'string') return false;
		if (!validCategory.includes(category)) return false;
	}

	// valid condition
	if (typeof listingData.condition !== 'string') return false;
	const validCondition = [
		'BRAND NEW',
		'LIKE NEW',
		'FAIRLY USED',
		'USEABLE',
		'BARELY FUNCTIONAL',
	];
	if (!validCondition.includes(listingData.condition)) return false;

	// valid seller
	if (typeof listingData.seller !== 'object') return false;
	if (!('uid' in listingData.seller)) return false;
	if (typeof listingData.seller.uid !== 'string') return false;
	// TODO: make sure photoURL and displayName is not null with custom database
	if (!('photoURL' in listingData.seller)) return false;
	if (!('displayName' in listingData.seller)) return false;

	// valid description
	if (typeof listingData.description !== 'string') return false;

	// valid savedBy
	if (typeof listingData.savedBy !== 'number') return false;
	return true;
};

/**
 * check if input data is valid
 */
const validListingData: (listingData: ListingData) => boolean = (
	listingData
) => {
	if (!validType(listingData)) return false;
	// TODO: implement other data censor/filter
	return true;
};
export default validListingData;
