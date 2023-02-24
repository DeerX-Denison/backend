import { Timestamp as FirebaseTimestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

export class Timestamp extends FirebaseTimestamp {
	public _seconds: number;
	public _nanoseconds: number;
	constructor(seconds: number, nanoseconds: number) {
		super(seconds, seconds);
		this._seconds = z.number().parse(seconds);
		this._nanoseconds = z.number().parse(nanoseconds);
	}

	static now(): Timestamp {
		const now = FirebaseTimestamp.now();
		return new this(now.seconds, now.nanoseconds);
	}
}
