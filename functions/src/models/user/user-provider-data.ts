import { z } from 'zod';
import { NonEmptyString } from '../non-empty-string';
import { Email } from '../email';
import { PhoneNumber } from '../phone-number';

export const UserProviderDataSchema = z.object({
	uid: NonEmptyString,
	displayName: NonEmptyString.optional().nullable(),
	email: Email.optional().nullable(),
	phoneNumber: PhoneNumber.optional().nullable(),
	photoURL: NonEmptyString.url().optional().nullable(),
	providerId: NonEmptyString,
});

export type UserProviderDataData = z.infer<typeof UserProviderDataSchema>;

export class UserProviderData {
	public static parse(data: unknown) {
		return UserProviderDataSchema.parse(data);
	}
}
