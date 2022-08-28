import { z } from 'zod';
import { Listing } from '../listing';

export const DeleteListingRequest = Listing.pick({
	id: true,
});

export type DeleteListingRequest = z.infer<typeof DeleteListingRequest>;
