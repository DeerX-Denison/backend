import { UserPronoun } from '../../../models/user';
import { NonEmptyString } from '../../non-empty-string';
import { z } from 'zod';

export const UpdateUserProfileRequest = z
	.object({
		imageUrl: NonEmptyString.optional(),
		bio: NonEmptyString.optional(),
		pronouns: z.array(z.nativeEnum(UserPronoun)).optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0);

export type UpdateUserProfileRequest = z.infer<typeof UpdateUserProfileRequest>;
