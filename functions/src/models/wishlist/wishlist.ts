import { NonEmptyString } from '../non-empty-string';
import { TimestampSchema } from '../timestamp';
import { Url } from '../url';
import { UserProfileSchema } from '../user/user-profile';
import { z } from 'zod';
import { Firebase } from '../../services/firebase';
import { Collection } from '../collection-name';
import { ModelOptions } from '../model-options';

export const WishlistSchema = z.object({
	id: NonEmptyString,
	thumbnail: Url,
	name: NonEmptyString,
	price: NonEmptyString,
	seller: UserProfileSchema,
	addedAt: TimestampSchema,
	searchableKeyword: z.array(NonEmptyString).default([]),
});

export type WishlistData = z.infer<typeof WishlistSchema>;

export class Wishlist {
	public static parse(data: unknown) {
		return WishlistSchema.parse(data);
	}

	/**
	 * Create a wishlist with input data to user with input uid
	 * @param uid uid of user to create input wishlist of
	 * @param wishlist wishlist to create
	 * @param opts create options
	 * @returns Promise that resolves when finish create
	 */
	public static async create(
		uid: string,
		wishlist: WishlistData,
		opts: ModelOptions = {}
	): Promise<void> {
		const newWishlistRef = Firebase.db
			.collection(Collection.users)
			.doc(uid)
			.collection(Collection.wishlist)
			.doc(wishlist.id);
		const newWishlist = { ...wishlist, addedAt: Firebase.serverTime() };
		if (opts.transaction) {
			opts.transaction.set(newWishlistRef, newWishlist);
			return;
		}
		if (opts.batch) {
			opts.batch.set(newWishlistRef, newWishlist);
			return;
		}
		await newWishlistRef.set(newWishlist);
		return;
	}

	/**
	 * Delete a wishlist with input id of user with input uid
	 * @param uid uid of user to delete input wishlist of
	 * @param wishlistId id of wishlist to delete
	 * @param opts delete options
	 * @returns Promise that resolves when finish delete
	 */
	public static async delete(
		uid: string,
		wishlistId: string,
		opts: ModelOptions = {}
	) {
		const wishlistRef = Firebase.db
			.collection(Collection.users)
			.doc(uid)
			.collection(Collection.wishlist)
			.doc(wishlistId);
		if (opts.transaction) {
			opts.transaction.delete(wishlistRef);
			return;
		}
		if (opts.batch) {
			opts.batch.delete(wishlistRef);
			return;
		}
		await wishlistRef.delete();
		return;
	}
}
