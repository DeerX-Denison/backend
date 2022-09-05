import { z } from 'zod';

export const NonEmptyString = z.string().min(1);

export type NonEmptyString = z.infer<typeof NonEmptyString>;
