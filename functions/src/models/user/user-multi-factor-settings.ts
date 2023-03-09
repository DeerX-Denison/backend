import { z } from 'zod';
import { UserMultiFactorInfoSchema } from './user-multi-factor-info';

export const UserMultiFactorSettingsSchema = z.object({
	enrolledFactors: z.array(UserMultiFactorInfoSchema),
});

export type UserMultiFactorSettingsData = z.infer<
	typeof UserMultiFactorSettingsSchema
>;

export class UserMultiFactorSettings {
	public static parse(data: unknown) {
		return UserMultiFactorSettingsSchema.parse(data);
	}
}
