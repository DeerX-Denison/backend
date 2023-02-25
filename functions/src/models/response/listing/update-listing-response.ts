import { NonEmptyString } from '../../non-empty-string';
import { z } from 'zod';

export const UpdateListingResponse = z.object({ id: NonEmptyString });

export type UpdateListingResponse = z.infer<typeof UpdateListingResponse>;
