import { Room } from '../../../models/room';
import { z } from 'zod';

export const CreateThreadResponse = z.object({
	room: Room,
});

export type CreateThreadResponse = z.infer<typeof CreateThreadResponse>;
