import { NonEmptyString } from '../non-empty-string';
import { z } from 'zod';
import { Firebase } from '../../services/firebase';

export const ProfileImageMetadataSchema = z.object({
	uploaderUid: NonEmptyString,
	imgId: NonEmptyString,
	resized: NonEmptyString,
	contentValidated: NonEmptyString,
});

export type ProfileImageMetadataData = z.infer<
	typeof ProfileImageMetadataSchema
>;

export class ProfileImageMetadata {
	public static parse(data: unknown) {
		return ProfileImageMetadataSchema.parse(data);
	}

	/**
	 * get listing image metadata from input object reference
	 * @param ref object reference to get listing image metadata from
	 * @returns listing image metadata
	 */
	public static async get(ref: string): Promise<ProfileImageMetadataData> {
		const imageFile = Firebase.storage.file(ref);

		const [{ metadata }] = await imageFile.getMetadata();

		return ProfileImageMetadataSchema.parse(metadata);
	}
}
