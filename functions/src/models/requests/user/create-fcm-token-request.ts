import { NonEmptyString } from '../../non-empty-string';
import z from 'zod';

export const CreateFCMTokenRequest = z.object({
	deviceId: NonEmptyString,
	token: NonEmptyString,
});

export type CreateFCMTokenRequest = z.infer<typeof CreateFCMTokenRequest>;
