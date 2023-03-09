import { Timestamp as FirebaseTimestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

export const TimestampSchema = z
	.object({
		seconds: z.number().optional(),
		nanoseconds: z.number().optional(),
		_seconds: z.number().optional(),
		_nanoseconds: z.number().optional(),
	})
	.refine(
		(obj) =>
			(obj.seconds !== undefined && obj.nanoseconds !== undefined) ||
			(obj._seconds !== undefined && obj._nanoseconds !== undefined),
		'Neither is seconds or _seconds is defined'
	)
	.transform((obj) => {
		if (obj.seconds !== undefined && obj.nanoseconds !== undefined) {
			return new Timestamp(obj.seconds, obj.nanoseconds);
		} else {
			return new Timestamp(
				z.number().parse(obj._seconds),
				z.number().parse(obj._nanoseconds)
			);
		}
	});

export type TimestampData = z.infer<typeof TimestampSchema>;

export class Timestamp extends FirebaseTimestamp {
	constructor(seconds: number, nanoseconds: number) {
		super(seconds, nanoseconds);
	}

	public static parse(data: unknown) {
		return TimestampSchema.parse(data);
	}
}
