import { NonEmptyString } from '../non-empty-string';
import { z } from 'zod';

export const ActionCodeSettingsSchema = z.object({
	url: NonEmptyString,
	handleCodeInApp: z.boolean().optional(),
	iOS: z
		.object({
			bundleId: NonEmptyString,
		})
		.optional(),
	android: z
		.object({
			packageName: NonEmptyString,
			installApp: z.boolean().optional(),
			minimumVersion: NonEmptyString.optional(),
		})
		.optional(),
	dynamicLinkDomain: NonEmptyString.optional(),
});

export type ActionCodeSettingsData = z.infer<typeof ActionCodeSettingsSchema>;
