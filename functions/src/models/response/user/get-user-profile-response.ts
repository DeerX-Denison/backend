import { UserProfile } from '../../../models/user';
import { z } from 'zod';

export const GetUserProfileResponse = UserProfile;

export type GetUserProfileResponse = z.infer<typeof GetUserProfileResponse>;
