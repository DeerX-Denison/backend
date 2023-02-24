import { NonEmptyString } from '../../../models/non-empty-string';
import { Email } from '../../../models/email';
import z from 'zod';

export const CreateTestUserRequest = z.object({
	email: Email,
	password: NonEmptyString,
	createTestUserToken: NonEmptyString,
});

export type CreateTestUserRequest = z.infer<typeof CreateTestUserRequest>;
