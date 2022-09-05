import { z } from 'zod';
import * as admin from 'firebase-admin';

export const Timestamp = z.instanceof(admin.firestore.Timestamp);

export type Timestamp = z.infer<typeof Timestamp>;
