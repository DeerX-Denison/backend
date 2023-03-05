import { Thread } from '../../thread';
import { z } from 'zod';

export const CreateThreadRequest = Thread.omit({
	thumbnail: true,
	name: true,
	members: true,
	latestMessage: true,
	latestTime: true,
	latestSenderUid: true,
	latestSeenAt: true,
});

export type CreateThreadRequest = z.infer<typeof CreateThreadRequest>;
