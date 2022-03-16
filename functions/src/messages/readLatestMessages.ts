import * as functions from 'firebase-functions';
import { ThreadData } from 'types';
import { db, svTime, Timestamp } from '../firebase.config';
import Logger from '../Logger';
import { fetchUser } from '../utils';

const logger = new Logger();

const readLatestMessages = functions.https.onCall(
	async (threadData: ThreadData, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}
		const userInfo = await fetchUser(context.auth.uid);
		const notSeenMessages = threadData.messages.filter(
			(x) => x.seenAt[userInfo.uid] === null
		);

		// convert notSeenMessages to seenMessages
		const seenMessages = notSeenMessages.map((x) => {
			return {
				...x,
				seenAt: { ...x.seenAt, [userInfo.uid]: svTime() as Timestamp },
			};
		});

		try {
			const batch = db.batch();
			seenMessages.forEach((msg) => {
				batch.update(
					db
						.collection('threads')
						.doc(threadData.id)
						.collection('messages')
						.doc(msg.id),
					msg
				);
			});
			await batch.commit();
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				'Fail to read latest messages',
				error
			);
		}
		return 'ok';
	}
);

export default readLatestMessages;
