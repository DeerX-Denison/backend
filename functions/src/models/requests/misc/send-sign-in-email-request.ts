import { ActionCodeSettingsSchema } from '../../misc/action-code-settings';
import { NonEmptyString } from '../../non-empty-string';
import { z } from 'zod';

export const SendSigninEmailRequest = z.object({
	email: NonEmptyString.email().refine((s) => s.endsWith('@denison.edu')),
	actionCodeSettings: ActionCodeSettingsSchema,
});

export type SendSigninEmailRequest = z.infer<typeof SendSigninEmailRequest>;
