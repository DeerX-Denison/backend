import { z } from 'zod';
import { Listing } from '../../listing';

export const UpdateListingRequest = Listing.pick({
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
