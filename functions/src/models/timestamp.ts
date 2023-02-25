import { Timestamp as FirebaseTimestamp } from 'firebase-admin/firestore';

export class Timestamp extends FirebaseTimestamp {
	constructor(seconds: number, nanoseconds: number) {
		super(seconds, nanoseconds);
	}
}
