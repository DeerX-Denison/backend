import { NonEmptyString } from '../../../models/non-empty-string';
import { z } from 'zod';

export const UpdateFCMTokenRequest = z.object({
	deviceId: NonEmptyString,
	token: NonEmptyString,
});

export type UpdateFCMTokenRequest = z.infer<typeof UpdateFCMTokenRequest>;
