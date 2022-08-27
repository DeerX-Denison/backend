import { z } from 'zod';

export const uid = z.string().min(1);

export const displayName = z.string().min(1).optional().nullable();

export const email = z.string().min(1).email().optional().nullable();

export const phoneNumber = z
	.string()
	.min(1)
	.regex(/^\\+\d{7,16}$/)
	.optional()
	.nullable();

export const photoURL = z.string().min(1).url().optional().nullable();

export const UserMetadata = z.object({
	lastSignInTime: z.string().min(1).optional().nullable(),
	creationTime: z.string().min(1).optional().nullable(),
	lastRefreshTime: z.string().min(1).optional().nullable(),
});

export const UserProviderData = z.object({
	uid,
	displayName,
	email,
	phoneNumber,
	photoURL,
	providerId: z.string().min(1),
});

export const UserMultiFactorInfo = z.object({
	uid,
	displayName,
	enrollmentTime: z.string().min(1).optional(),
	factorId: z.string().min(1),
	phoneNumber,
});

export const UserMultiFactorSettings = z.object({
	enrolledFactors: z.array(UserMultiFactorInfo),
});

export enum UserRole {
	'GuestUser' = 0,
	'NormalUser' = 10,
	'Moderator' = 20,
	'Admin' = 30,
}

export enum UserProfileStatus {
	'private' = 'private',
	'public' = 'public',
}

export const User = z.object({
	uid,
	email,
	emailVerified: z.boolean(),
	displayName,
	photoURL,
	phoneNumber,
	disabled: z.boolean(),
	metadata: UserMetadata,
	providerData: z.array(UserProviderData),
	passwordHash: z.string().min(1).optional(),
	passwordSalt: z.string().min(1).optional(),
	tokensValidAfterTime: z.string().min(1),
	tenantId: z.string().min(1).optional().nullable(),
	multiFactor: UserMultiFactorSettings.optional(),
	role: z.nativeEnum(UserRole).optional(),
	profileStatus: z.nativeEnum(UserProfileStatus).optional(),
	followersId: z.array(z.string().min(1)).optional(),
	followingId: z.array(z.string().min(1)).optional(),
});

export type User = z.infer<typeof User>;

export const UserProfile = User.pick({
	uid: true,
	email: true,
	displayName: true,
	photoURL: true,
});

export type UserProfile = z.infer<typeof UserProfile>;
