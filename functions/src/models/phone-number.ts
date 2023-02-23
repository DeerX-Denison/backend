import { z } from 'zod';

export const PhoneNumber = z.string().min(1);

export type PhoneNumber = z.infer<typeof PhoneNumber>;
