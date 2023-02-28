import { z } from 'zod';
import { Email } from './email';
import { PhoneNumber } from './phone-number';
import { NonEmptyString } from './non-empty-string';

export const UserMetadata = z.object({
	lastSignInTime: NonEmptyString.optional().nullable(),
	creationTime: NonEmptyString.optional().nullable(),
	lastRefreshTime: NonEmptyString.optional().nullable(),
});

export const UserProviderData = z.object({
	uid: NonEmptyString,
	displayName: NonEmptyString.optional().nullable(),
	email: Email.optional().nullable(),
	phoneNumber: PhoneNumber.optional().nullable(),
	photoURL: NonEmptyString.url().optional().nullable(),
	providerId: NonEmptyString,
});

export const UserMultiFactorInfo = z.object({
	uid: NonEmptyString,
	displayName: NonEmptyString.optional().nullable(),
	enrollmentTime: NonEmptyString.optional(),
	factorId: NonEmptyString,
	phoneNumber: PhoneNumber.optional().nullable(),
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

export enum UserPronoun {
	'CO' = 'CO',
	'COS' = 'COS',
	'E' = 'E',
	'EY' = 'EY',
	'EM' = 'EM',
	'EIR' = 'EIR',
	'FAE' = 'FAE',
	'FAER' = 'FAER',
	'HE' = 'HE',
	'HIM' = 'HIM',
	'HIS' = 'HIS',
	'HER' = 'HER',
	'HERS' = 'HERS',
	'HIR' = 'HIR',
	'IT' = 'IT',
	'ITS' = 'ITS',
	'MER' = 'MER',
	'MERS' = 'MERS',
	'NE' = 'NE',
	'NIR' = 'NIR',
	'NIRS' = 'NIRS',
	'NEE' = 'NEE',
	'NER' = 'NER',
	'NERS' = 'NERS',
	'PER' = 'PER',
	'PERS' = 'PERS',
	'SHE' = 'SHE',
	'THEY' = 'THEY',
	'THEM' = 'THEM',
	'THEIRS' = 'THEIRS',
	'THON' = 'THON',
	'THONS' = 'THONS',
	'VE' = 'VE',
	'VER' = 'VER',
	'VIS' = 'VIS',
	'VI' = 'VI',
	'VIR' = 'VIR',
	'XE' = 'XE',
	'XEM' = 'XEM',
	'XYR' = 'XYR',
	'ZE' = 'ZE',
	'ZIR' = 'ZIR',
	'ZIE' = 'ZIE',
}

export const User = z.object({
	uid: NonEmptyString,
	email: Email,
	emailVerified: z.boolean(),
	displayName: NonEmptyString.optional().nullable(),
	photoURL: NonEmptyString.optional().nullable(),
	pronouns: z.array(z.nativeEnum(UserPronoun)).optional().nullable(),
	bio: NonEmptyString.optional().nullable(),
	phoneNumber: PhoneNumber.optional().nullable(),
	disabled: z.boolean(),
	metadata: UserMetadata,
	providerData: z.array(UserProviderData),
	passwordHash: NonEmptyString.optional(),
	passwordSalt: NonEmptyString.optional(),
	tokensValidAfterTime: NonEmptyString.optional().nullable(),
	tenantId: NonEmptyString.optional().nullable(),
	multiFactor: UserMultiFactorSettings.optional(),
	role: z.nativeEnum(UserRole).optional(),
	profileStatus: z.nativeEnum(UserProfileStatus).optional(),
	followersId: z.array(NonEmptyString).optional(),
	followingId: z.array(NonEmptyString).optional(),
});

export type User = z.infer<typeof User>;

export const UserProfile = User.pick({
	uid: true,
	email: true,
	displayName: true,
	photoURL: true,
	bio: true,
	pronouns: true,
});

export type UserProfile = z.infer<typeof UserProfile>;

export const UserInfo = User.pick({
	uid: true,
	email: true,
	displayName: true,
	photoURL: true,
	disabled: true,
});

export type UserInfo = z.infer<typeof UserInfo>;
