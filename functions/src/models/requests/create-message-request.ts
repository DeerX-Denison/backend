import { Message } from '../../models/message';
import { Room } from '../../models/room';
import { z } from 'zod';

export const CreateMessageRequest = z.object({
	threadPreviewData: Room,
	message: Message,
});

export type CreateMessageRequest = z.infer<typeof CreateMessageRequest>;
