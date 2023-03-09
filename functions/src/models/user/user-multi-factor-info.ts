import { z } from 'zod';
import { NonEmptyString } from '../non-empty-string';
import { PhoneNumber } from '../phone-number';

export const UserMultiFactorInfoSchema = z.object({
	uid: NonEmptyString,
	displayName: NonEmptyString.optional().nullable(),
	enrollmentTime: NonEmptyString.optional(),
	factorId: NonEmptyString,
	phoneNumber: PhoneNumber.optional().nullable(),
});

export type UserMultiFactorInfoData = z.infer<typeof UserMultiFactorInfoSchema>;

export class UserMultiFactorInfo {
	public static parse(data: unknown) {
		return UserMultiFactorInfoSchema.parse(data);
	}
}
