import { z } from 'zod';

export const GetUserProfileRequest = z.string().transform((s) => ({ uid: s }));

export type GetUserProfileRequest = z.infer<typeof GetUserProfileRequest>;
