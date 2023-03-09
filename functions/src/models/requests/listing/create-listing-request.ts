import { z } from 'zod';
import { ListingSchema } from '../../listing/listing';

export const CreateListingRequest = ListingSchema.pick({
	id: true,
	images: true,
	name: true,
	price: true,
	category: true,
	condition: true,
	description: true,
	status: true,
});

export type CreateListingRequest = z.infer<typeof CreateListingRequest>;
