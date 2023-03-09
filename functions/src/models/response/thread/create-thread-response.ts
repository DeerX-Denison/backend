import { ThreadSchema } from '../../thread/thread';
import { z } from 'zod';

export const CreateThreadResponse = z.object({
	room: ThreadSchema,
});

export type CreateThreadResponse = z.infer<typeof CreateThreadResponse>;
