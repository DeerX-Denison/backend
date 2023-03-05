import { Message } from '../../message';
import { Thread } from '../../thread';
import { z } from 'zod';
export const CreateMessageRequest = z.object({
	threadPreviewData: Thread.omit({
		thumbnail: true,
		name: true,
		members: true,
		latestMessage: true,
		latestTime: true,
		latestSenderUid: true,
		latestSeenAt: true,
	}),
	message: Message,
});

export type CreateMessageRequest = z.infer<typeof CreateMessageRequest>;
