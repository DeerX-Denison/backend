import { z } from 'zod';
export const UserProfile = z.object({
	uid: z.string(),
	email: z.string().email().optional().nullable(),
	photoURL: z.string().url().optional().nullable(),
	displayName: z.string().optional().nullable(),
});

export const User = UserProfile.and(z.object({}));
