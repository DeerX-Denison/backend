import { z } from 'zod';
import { NonEmptyString } from './non-empty-string';
import { Timestamp } from './timestamp';
import { Url } from './url';
import { UserProfile } from './user';

export const Room = z.object({
	id: NonEmptyString,
	members: z.array(UserProfile),
	membersUid: z.array(NonEmptyString).min(2),
	thumbnail: z.record(NonEmptyString, Url),
	name: z.record(NonEmptyString, NonEmptyString),
	latestMessage: NonEmptyString,
	latestTime: z.instanceof(Timestamp),
	latestSenderUid: NonEmptyString,
	latestSeenAt: z.record(
		NonEmptyString,
		z.union([z.instanceof(Timestamp), z.null()])
	),
});

export type Room = z.infer<typeof Room>;
