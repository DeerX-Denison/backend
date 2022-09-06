import { z } from 'zod';
import * as admin from 'firebase-admin';

export const Timestamp = z.union([
	z.instanceof(admin.firestore.Timestamp),
	z.object({
		_nanoseconds: z.number(),
		_seconds: z.number(),
	}),
]);

export type Timestamp = z.infer<typeof Timestamp>;
