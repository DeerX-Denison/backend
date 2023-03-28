import { z } from 'zod';
import { Email } from '../email';
import { NonEmptyString } from '../non-empty-string';
import { UserPronoun } from './user-pronouns';

export const UserProfileSchema = z.object({
	uid: NonEmptyString,
	email: Email,
	displayName: NonEmptyString.optional().nullable(),
	photoURL: NonEmptyString.optional().nullable(),
	bio: NonEmptyString.optional().nullable(),
	pronouns: z.array(z.nativeEnum(UserPronoun)).optional().nullable(),
});

export type UserProfileData = z.infer<typeof UserProfileSchema>;

export class UserProfile {
	public static parse(data: unknown) {
		return UserProfileSchema.parse(data);
	}
}
