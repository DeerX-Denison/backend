import { NonEmptyString } from '../non-empty-string';
import { TimestampSchema } from '../timestamp';
import { z } from 'zod';

export const MessageSeenAtSchema = z.record(
	NonEmptyString,
	z.union([TimestampSchema, z.null()])
);

export type MessageSeenAtData = z.infer<typeof MessageSeenAtSchema>;

export class MessageSeenAt {
	public static parse(data: unknown) {
		return MessageSeenAtSchema.parse(data);
	}
}
