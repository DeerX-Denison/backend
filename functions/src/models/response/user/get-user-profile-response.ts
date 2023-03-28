import { UserProfileSchema } from '../../user/user-profile';
import { z } from 'zod';

export const GetUserProfileResponse = UserProfileSchema;

export type GetUserProfileResponse = z.infer<typeof GetUserProfileResponse>;
