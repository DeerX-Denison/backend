import { Room } from '../../room';
import { z } from 'zod';

export const CreateThreadRequest = Room.omit({
	thumbnail: true,
	name: true,
	members: true,
	latestMessage: true,
	latestTime: true,
	latestSenderUid: true,
	latestSeenAt: true,
});

export type CreateThreadRequest = z.infer<typeof CreateThreadRequest>;
