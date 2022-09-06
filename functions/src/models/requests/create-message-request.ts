import { Message } from '../../models/message';
import { Room } from '../../models/room';
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
