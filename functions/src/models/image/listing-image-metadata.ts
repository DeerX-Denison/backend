import { NonEmptyString } from '../non-empty-string';
import { z } from 'zod';
import { Firebase } from '../../services/firebase';

export const ListingImageMetadataSchema = z.object({
	uploader: NonEmptyString,
	listingId: NonEmptyString,
	imageId: NonEmptyString,
	resized: NonEmptyString,
	contentValidated: NonEmptyString,
});

export type ListingImageMetadataData = z.infer<
	typeof ListingImageMetadataSchema
>;

export class ListingImageMetadata {
	public static parse(data: unknown) {
		return ListingImageMetadataSchema.parse(data);
	}

	/**
	 * get listing image metadata from input object reference
	 * @param ref object reference to get listing image metadata from
	 * @returns listing image metadata
	 */
	public static async get(ref: string): Promise<ListingImageMetadataData> {
		const imageFile = Firebase.storage.file(ref);

		const [{ metadata }] = await imageFile.getMetadata();

		return ListingImageMetadataSchema.parse(metadata);
	}
}
