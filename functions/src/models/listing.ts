import { z } from 'zod';
import { NonEmptyString } from './non-empty-string';
import { Timestamp } from './timestamp';
import { Url } from './url';
import { UserProfile } from './user';

export enum ListingCategory {
	'FURNITURE' = 'FURNITURE',
	'FASHION' = 'FASHION',
	'BOOKS' = 'BOOKS',
	'SEASONAL' = 'SEASONAL',
	'DORM GOODS' = 'DORM GOODS',
	'JEWELRIES' = 'JEWELRIES',
	'ELECTRONIC' = 'ELECTRONIC',
	'INSTRUMENT' = 'INSTRUMENT',
}

export enum ListingCondition {
	'BRAND NEW' = 'BRAND NEW',
	'LIKE NEW' = 'LIKE NEW',
	'FAIRLY USED' = 'FAIRLY USED',
	'USEABLE' = 'USEABLE',
	'BARELY FUNCTIONAL' = 'BARELY FUNCTIONAL',
}

export enum ListingStatus {
	'POSTED' = 'posted',
	'SAVED' = 'saved',
	'SOLD' = 'sold',
}

export const ListingImageMetadata = z.object({
	uploader: NonEmptyString,
	listingId: NonEmptyString,
	imageId: NonEmptyString,
	resized: NonEmptyString,
	contentValidated: NonEmptyString,
});

export type ListingImageMetadata = z.infer<typeof ListingImageMetadata>;

export const Listing = z.object({
	id: NonEmptyString,
	images: z.array(Url).max(10).min(1),
	name: NonEmptyString,
	price: NonEmptyString,
	category: z.array(z.nativeEnum(ListingCategory)),
	seller: UserProfile,
	condition: z.nativeEnum(ListingCondition),
	description: NonEmptyString,
	likedBy: z.array(NonEmptyString).min(0),
	createdAt: z.instanceof(Timestamp),
	updatedAt: z.instanceof(Timestamp),
	status: z.nativeEnum(ListingStatus),
	soldTo: UserProfile.nullable().default(null),
});

export type Listing = z.infer<typeof Listing>;
