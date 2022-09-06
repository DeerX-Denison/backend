import { Room } from '../room';
import { z } from 'zod';

export const CreateRoomRequest = Room.omit({
	thumbnail: true,
	name: true,
	members: true,
	latestMessage: true,
	latestTime: true,
	latestSenderUid: true,
	latestSeenAt: true,
});

export type CreateRoomRequest = z.infer<typeof CreateRoomRequest>;
