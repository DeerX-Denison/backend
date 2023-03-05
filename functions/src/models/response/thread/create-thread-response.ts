import { Thread } from '../../thread';
import { z } from 'zod';

export const CreateThreadResponse = z.object({
	room: Thread,
});

export type CreateThreadResponse = z.infer<typeof CreateThreadResponse>;
