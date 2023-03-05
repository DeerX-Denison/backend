import { NonEmptyString } from '../../../models/non-empty-string';
import { z } from 'zod';

export const CreateListingResponse = z.object({ id: NonEmptyString });

export type CreateListingResponse = z.infer<typeof CreateListingResponse>;
