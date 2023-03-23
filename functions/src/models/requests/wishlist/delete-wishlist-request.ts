import { NonEmptyString } from '../../non-empty-string';
import { z } from 'zod';

export const DeleteWishlistRequest = NonEmptyString;

export type DeleteWishlistRequest = z.infer<typeof DeleteWishlistRequest>;
