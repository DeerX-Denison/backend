import { z } from 'zod';
import { ListingSchema } from '../../listing/listing';

export const UpdateListingRequest = ListingSchema.pick({
	id: true,
	images: true,
	name: true,
	price: true,
	category: true,
	condition: true,
	description: true,
	status: true,
	soldTo: true,
});

export type UpdateListingRequest = z.infer<typeof UpdateListingRequest>;
