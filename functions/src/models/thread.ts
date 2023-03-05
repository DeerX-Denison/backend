import { z } from 'zod';
import { NonEmptyString } from './non-empty-string';
import { Url } from './url';
import { UserProfile } from './user';
import { ZodTimestamp } from './zod-timestamp';

export const Thread = z.object({
	id: NonEmptyString,
	members: z.array(UserProfile),
	membersUid: z.array(NonEmptyString).min(2),
	thumbnail: z.record(NonEmptyString, Url),
	name: z.record(NonEmptyString, NonEmptyString),
	latestMessage: NonEmptyString,
	latestTime: ZodTimestamp,
	latestSenderUid: NonEmptyString,
	latestSeenAt: z.record(NonEmptyString, z.union([ZodTimestamp, z.null()])),
});

export type Room = z.infer<typeof Thread>;
