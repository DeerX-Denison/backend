import { WishlistData } from 'types';

/**
 * check if input wishlistData has valid type for its key
 * Check if wishlistData has valid data. if not delete the coument. This is to prevent malicious user from abusting firestore REST API to programmatically create document. Data created/updated from the app by normal user should be valid
 */
const validType: (wishlistData: WishlistData) => boolean = (wishlistData) => {
	// valid id
	if (typeof wishlistData.id !== 'string') return false;

	// valid image array
	if (typeof wishlistData.thumbnail !== 'string') return false;
	if (!wishlistData.thumbnail.startsWith('http')) return false;
	if (
		!(
			wishlistData.thumbnail.includes('.jpg') ||
			wishlistData.thumbnail.includes('.jpeg') ||
			wishlistData.thumbnail.includes('.png') ||
			wishlistData.thumbnail.includes('.heif') ||
			wishlistData.thumbnail.includes('.heic')
		)
	)
		return false;

	// valid name
	if (typeof wishlistData.name !== 'string') return false;

	// valid price
	if (typeof wishlistData.price !== 'string') return false;
	if (isNaN(parseFloat(wishlistData.price))) return false;

	// valid seller
	if (typeof wishlistData.seller !== 'object') return false;
	if (!('uid' in wishlistData.seller)) return false;
	if (typeof wishlistData.seller.uid !== 'string') return false;
	if (!('photoURL' in wishlistData.seller)) return false;
	if (!('displayName' in wishlistData.seller)) return false;

	// valid searchable keyword
	if (typeof wishlistData.searchableKeyword !== 'object') return false;
	if (!Array.isArray(wishlistData.searchableKeyword)) return false;
	for (let i = 0; i < wishlistData.searchableKeyword.length; i++) {
		if (typeof wishlistData.searchableKeyword[i] !== 'string') return false;
	}

	return true;
};

const validWishlistData: (wishlistData: WishlistData) => boolean = (
	wishlistData
) => {
	if (!validType(wishlistData)) return false;
	// TODO: implement other data censor/filter
	return true;
};

export default validWishlistData;
