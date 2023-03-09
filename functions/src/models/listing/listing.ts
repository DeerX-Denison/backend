import { z } from 'zod';
import { NonEmptyString } from '../non-empty-string';
import { Url } from '../url';
import { UserProfileSchema } from '../user/user-profile';
import { ListingCategory } from './listing-category';
import { ListingCondition } from './listing-condition';
import { ListingStatus } from './listing-status';
import { TimestampSchema } from '../timestamp';
import { Firebase } from '../../services/firebase';
import { Collection } from '../collection-name';
import { NotFoundError } from '../error/not-found-error';
import { CloudStorage } from '../../services/cloud-storage';

export const ListingSchema = z.object({
	id: NonEmptyString,
	images: z.array(Url).max(10).min(1),
	name: NonEmptyString,
	price: NonEmptyString,
	category: z.array(z.nativeEnum(ListingCategory)),
	seller: UserProfileSchema,
	condition: z.nativeEnum(ListingCondition),
	description: NonEmptyString,
	likedBy: z.array(NonEmptyString).min(0),
	createdAt: TimestampSchema,
	updatedAt: TimestampSchema,
	status: z.nativeEnum(ListingStatus),
	soldTo: UserProfileSchema.nullable().default(null),
});

export type ListingData = z.infer<typeof ListingSchema>;

export class Listing {
	public static parse(data: unknown) {
		return ListingSchema.parse(data);
	}

	/**
	 * write a listing to database
	 * @param data listing data to write to database
	 * @returns id of new listing
	 */
	public static async create(
		data: Omit<ListingData, 'createdAt' | 'updatedAt'>
	): Promise<string> {
		const newListing = this.parse({
			...data,
			createdAt: Firebase.localTime(),
			updatedAt: Firebase.localTime(),
		});
		await Firebase.db
			.collection(Collection.listings)
			.doc(data.id)
			.set({
				...newListing,
				createdAt: Firebase.serverTime(),
				updatedAt: Firebase.serverTime(),
			});
		return data.id;
	}

	/**
	 * get a user from database
	 * @param id id of target user to fetch
	 * @returns user data from database
	 */
	public static async get(id: string): Promise<ListingData> {
		const documentSnapshot = await Firebase.db
			.collection(Collection.listings)
			.doc(id)
			.get();
		if (!documentSnapshot.exists || documentSnapshot.data() === undefined) {
			throw new NotFoundError(new Error('Listing not exist'));
		}
		return this.parse(documentSnapshot.data());
	}

	/**
	 * update a listing from database
	 * @param id id of listing to update
	 */
	public static async update(
		id: string,
		data: Omit<ListingData, 'createdAt' | 'updatedAt'>
	): Promise<void> {
		if (data.status !== ListingStatus.SOLD) {
			data.soldTo = null;
		}
		const updatedData = this.parse(data);
		await Firebase.db
			.collection(Collection.listings)
			.doc(id)
			.update({ ...updatedData, updatedAt: Firebase.serverTime() });

		const deletedImagesUrl = data.images.filter(
			(url) => !data.images.includes(url)
		);

		const deletedImageRefs = deletedImagesUrl.map(
			CloudStorage.extractObjectRefFromUrl
		);

		await Promise.all(deletedImageRefs.map(CloudStorage.delete));
	}

	/**
	 * delete a listing from database
	 * @param id id of listing to delete
	 */
	public static async delete(id: string): Promise<void> {
		await Firebase.db.collection(Collection.listings).doc(id).delete();
	}
}
