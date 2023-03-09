import { ThreadSchema } from '../../thread/thread';
import { MessageSchema } from '../../message/message';
import { z } from 'zod';
export const CreateMessageRequest = z.object({
	threadPreviewData: ThreadSchema.omit({
		thumbnail: true,
		name: true,
		members: true,
		latestMessage: true,
		latestTime: true,
		latestSenderUid: true,
		latestSeenAt: true,
	}),
	message: MessageSchema,
});

export type CreateMessageRequest = z.infer<typeof CreateMessageRequest>;
