import { NonEmptyString } from '../../../models/non-empty-string';
import { Email } from '../../../models/email';
import z from 'zod';

export const CreateTestUserResponse = z.object({
	uid: NonEmptyString,
	email: Email,
	password: NonEmptyString,
});

export type CreateTestUserResponse = z.infer<typeof CreateTestUserResponse>;
