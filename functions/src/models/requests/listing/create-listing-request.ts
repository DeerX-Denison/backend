import { z } from 'zod';
import { Listing } from '../../listing';

export const CreateListingRequest = Listing.pick({
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
