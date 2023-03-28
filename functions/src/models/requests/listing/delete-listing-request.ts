import { z } from 'zod';
import { ListingSchema } from '../../listing/listing';

export const DeleteListingRequest = ListingSchema.pick({
	id: true,
});

export type DeleteListingRequest = z.infer<typeof DeleteListingRequest>;
