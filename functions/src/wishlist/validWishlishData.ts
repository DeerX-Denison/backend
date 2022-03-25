import { WishlistData } from 'types';
import Logger from '../Logger';

const logger = new Logger();

const validWishlistData: (wishlist: WishlistData, userId: string) => boolean = (
	wishlist,
	userId
) => {
	// TODO: valid wishlist data
	logger.log('implement me at functions/wishlist/validWishlistData.ts');
	logger.log(wishlist);
	logger.log(userId);
	return true;
};

export default validWishlistData;
