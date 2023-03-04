import { Message } from '../../message';
import { Room } from '../../room';
import { z } from 'zod';

export const CreateMessageRequest = z.object({
	threadPreviewData: Room.omit({
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
