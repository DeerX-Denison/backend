import { z } from 'zod';
import { NonEmptyString } from './non-empty-string';
import { Timestamp } from './timestamp';
import { Url } from './url';
import { UserProfile } from './user';

export enum MessageContentType {
	'text' = 'text',
	'reference' = 'reference',
}

export const Message = z.object({
	id: NonEmptyString,
	sender: UserProfile,
	time: Timestamp,
	contentType: z.array(z.nativeEnum(MessageContentType)).min(1),
	content: NonEmptyString,
	membersUid: z.array(NonEmptyString).min(2),
	threadName: z.record(NonEmptyString, NonEmptyString),
	seenAt: z.record(NonEmptyString, z.union([Timestamp, z.null()])),
	refs: z.array(
		z.object({
			begin: z.number().min(0),
			end: z.number().min(0),
			data: z.object({
				id: NonEmptyString,
				thumbnail: Url,
			}),
		})
	),
});

export type Message = z.infer<typeof Message>;
