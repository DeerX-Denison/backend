import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { MessageData, MessageId, MessageSeenAt, ThreadId } from 'types';
import { db, svTime, Timestamp } from '../firebase.config';
import Logger from '../Logger';
import fetchMessage from '../utils/fetchMessage';
import updateThreadPreview from './updateThreadPreview';
export type ReadMessageData = { messageIds: MessageId[]; threadId: ThreadId };
const logger = new Logger();
const readMessages = functions.https.onCall(
	async ({ messageIds, threadId }: ReadMessageData, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}
		const readerUid = context.auth.uid;
		let tobeSeenMessages: MessageData[];
		try {
			tobeSeenMessages = await Promise.all(
				messageIds.map((messageId) => fetchMessage(messageId, threadId))
			);
		} catch (error) {
			throw new functions.https.HttpsError(
				'internal',
				'Fail to fetch to-be-read messages',
				error
			);
		}

		const seenMessages = tobeSeenMessages.map((msg) => {
			const parsedTime = new admin.firestore.Timestamp(
				msg.time.seconds,
				msg.time.nanoseconds
			);

			const updatedSeenAt: MessageSeenAt = {};
			const nonReaderUids = msg.membersUid.filter((uid) => uid !== readerUid);
			nonReaderUids.forEach((uid) => {
				if (
					'seenAt' in msg &&
					uid in msg['seenAt'] &&
					msg['seenAt'][uid] !== null
				) {
					const seconds = msg.seenAt[uid]?.seconds;
					const nanoseconds = msg.seenAt[uid]?.nanoseconds;
					if (seconds && nanoseconds) {
						updatedSeenAt[uid] = new admin.firestore.Timestamp(
							seconds,
							nanoseconds
						);
					}
				}
			});
			updatedSeenAt[readerUid] = svTime() as Timestamp;
			return {
				...msg,
				time: parsedTime,
				seenAt: updatedSeenAt,
			};
		});

		try {
			const batch = db.batch();
			seenMessages.forEach((msg) => {
				batch.update(
					db
						.collection('threads')
						.doc(threadId)
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
				'Fail to read to-be-read messages',
				error
			);
		}
		const sortedSeenMsgs: MessageData[] = seenMessages.sort((a, b) =>
			a.time.valueOf() > b.time.valueOf() ? -1 : 1
		);
		if (sortedSeenMsgs && sortedSeenMsgs.length > 0) {
			const latestMsg = sortedSeenMsgs[0];
			try {
				await updateThreadPreview(latestMsg, threadId);
			} catch (error) {
				logger.error(error);
				throw new functions.https.HttpsError(
					'internal',
					`Fail to update thread preview: ${threadId}`,
					error
				);
			}
		}
		return 'ok';
	}
);

export default readMessages;
