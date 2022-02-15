import { WishlistDataSV } from 'types';
import logger from '../logger';

const validWishlistData: (
	wishlist: WishlistDataSV,
	userId: string,
	listingId: string
) => boolean = (wishlist, userId, listingId) => {
	// TODO: valid wishlist data
	logger.log('implement me at functions/wishlist/validWishlistData.ts');
	logger.log(wishlist);
	logger.log(userId);
	logger.log(listingId);
	return true;
};

export default validWishlistData;
