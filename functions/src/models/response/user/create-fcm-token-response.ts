import z from 'zod';

export const CreateFCMTokenResponse = z.object({});

export type CreateFCMTokenResponse = z.infer<typeof CreateFCMTokenResponse>;
