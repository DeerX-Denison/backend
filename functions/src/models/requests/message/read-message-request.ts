import { NonEmptyString } from '../../../models/non-empty-string';
import { z } from 'zod';

export const ReadMessageRequest = z.object({
	messageIds: z.array(NonEmptyString),
	threadId: NonEmptyString,
});

export type ReadMessageRequest = z.infer<typeof ReadMessageRequest>;
