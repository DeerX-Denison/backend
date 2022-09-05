import { z } from 'zod';

export const Url = z.string().trim().url();

export type Url = z.infer<typeof Url>;
