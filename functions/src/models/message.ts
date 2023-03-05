import { z } from 'zod';
import { NonEmptyString } from './non-empty-string';
import { Url } from './url';
import { UserProfile } from './user';
import { ZodTimestamp } from './zod-timestamp';

export enum MessageContentType {
	'text' = 'text',
	'reference' = 'reference',
}

export const MessageSeenAt = z.record(
	NonEmptyString,
	z.union([ZodTimestamp, z.null()])
);

export type MessageSeenAt = z.infer<typeof MessageSeenAt>;

export const MessageRefs = z.array(
	z.object({
		begin: z.number().min(0),
		end: z.number().min(0),
		data: z.object({
			id: NonEmptyString,
			thumbnail: Url,
		}),
	})
);

export type MessageRefs = z.infer<typeof MessageRefs>;

export const Message = z.object({
	id: NonEmptyString,
	sender: UserProfile,
	time: ZodTimestamp,
	contentType: z.array(z.nativeEnum(MessageContentType)).min(1),
	content: NonEmptyString,
	membersUid: z.array(NonEmptyString).min(2),
	threadName: z.record(NonEmptyString, NonEmptyString),
	seenAt: MessageSeenAt,
	refs: MessageRefs,
});

export type Message = z.infer<typeof Message>;
