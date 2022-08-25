import { z } from 'zod';
import {
	ListingCategory,
	ListingCondition,
	ListingStatus,
} from '../../models/listing';

export const CreateListingRequest = z.object({
	id: z.string(),
	images: z
		.array(
			z
				.string()
				.trim()
				.regex(
					/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)?/
				)
		)
		.max(10)
		.min(1),
	name: z.string(),
	price: z.string(),
	category: z.array(z.nativeEnum(ListingCategory)),
	condition: z.nativeEnum(ListingCondition),
	description: z.string(),
	status: z.nativeEnum(ListingStatus),
});

export type CreateListingRequest = z.infer<typeof CreateListingRequest>;
