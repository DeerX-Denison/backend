import { ThreadSchema } from '../../thread/thread';
import { z } from 'zod';

export const CreateThreadRequest = ThreadSchema.pick({
	id: true,
	membersUid: true,
});

export type CreateThreadRequest = z.infer<typeof CreateThreadRequest>;
