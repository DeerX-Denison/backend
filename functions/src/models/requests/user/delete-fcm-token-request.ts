import { NonEmptyString } from '../../non-empty-string';
import z from 'zod';

export const DeleteFCMTokenRequest = z.object({
	deviceId: NonEmptyString,
	uid: NonEmptyString,
});

export type DeleteFCMTokenRequest = z.infer<typeof DeleteFCMTokenRequest>;
