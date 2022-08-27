import * as admin from 'firebase-admin';
import { z } from 'zod';
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
}

export const Listing = z.object({
	id: z.string(),
	images: z.array(z.string().trim().url()).max(10).min(1),
	name: z.string(),
	price: z.string(),
	category: z.array(z.nativeEnum(ListingCategory)),
	seller: UserProfile,
	condition: z.nativeEnum(ListingCondition),
	description: z.string(),
	savedBy: z.number().min(0),
	createdAt: z.instanceof(admin.firestore.Timestamp),
	updatedAt: z.instanceof(admin.firestore.Timestamp),
	status: z.nativeEnum(ListingStatus),
});

export type Listing = z.infer<typeof Listing>;
