import { z } from 'zod';
import { NonEmptyString } from '../non-empty-string';

export const UserMetadataSchema = z.object({
	lastSignInTime: NonEmptyString.optional().nullable(),
	creationTime: NonEmptyString.optional().nullable(),
	lastRefreshTime: NonEmptyString.optional().nullable(),
});

export type UserMetadataData = z.infer<typeof UserMetadataSchema>;

export class UserMetadata {
	public static parse(data: unknown) {
		return UserMetadataSchema.parse(data);
	}
}
