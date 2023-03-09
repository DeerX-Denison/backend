import { NonEmptyString } from '../non-empty-string';
import { Url } from '../url';
import { z } from 'zod';

export const MessageRefSchema = z.object({
	begin: z.number().min(0),
	end: z.number().min(0),
	data: z.object({
		id: NonEmptyString,
		thumbnail: Url,
	}),
});

export type MessageRefData = z.infer<typeof MessageRefSchema>;

export class MessageRef {
	public static parse(data: unknown) {
		return MessageRefSchema.parse(data);
	}
}
