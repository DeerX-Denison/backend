import { WishlistSchema } from '../../wishlist/wishlist';
import { z } from 'zod';

export const CreateWishlistRequest = WishlistSchema.omit({
	addedAt: true,
	seller: true,
	searchableKeyword: true,
});
export type CreateWishlistRequest = z.infer<typeof CreateWishlistRequest>;
