import { z } from 'zod';
import { Timestamp } from './timestamp';

export const ZodTimestamp = z
	.object({
		seconds: z.number().optional(),
		nanoseconds: z.number().optional(),
		_seconds: z.number().optional(),
		_nanoseconds: z.number().optional(),
	})
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

export type ZodTimestamp = z.infer<typeof ZodTimestamp>;
