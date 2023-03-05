import { z } from 'zod';

export const Email = z.string().min(1).email();

export type Email = z.infer<typeof Email>;
