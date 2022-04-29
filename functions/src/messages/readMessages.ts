import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { MessageData, MessageId, MessageSeenAt, ThreadId } from 'types';
import { db, svTime, Timestamp } from '../firebase.config';
import Logger from '../Logger';
import { isLoggedIn } from '../utils';
import fetchMessage from '../utils/fetchMessage';

export type ReadMessageData = { messageIds: MessageId[]; threadId: ThreadId };

const logger = new Logger();

const readMessages = functions.https.onCall(
	async ({ messageIds, threadId }: ReadMessageData, context) => {
		const invokerUid = isLoggedIn(context);
		const readerUid = invokerUid;
		// messages that has not been read by function invoker
		let tobeSeenMessages: MessageData[];
		try {
			tobeSeenMessages = (
				await Promise.all(
					messageIds.map((messageId) => fetchMessage(messageId, threadId))
				)
			).filter((x) => x !== undefined) as MessageData[];
		} catch (error) {
			throw new functions.https.HttpsError(
				'internal',
				'Fail to fetch to-be-read messages',
				error
			);
		}

		// transform messages that has not been read by function invoker
		// to messages that has been read by function invoker
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

		// if there are messages that needs to be seen
		if (seenMessages.length > 0) {
			const batch = db.batch();

			// mark messages as read by function invoker
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

			// get latest message
			const sortedSeenMsgs: MessageData[] = seenMessages.sort((a, b) =>
				a.time.valueOf() > b.time.valueOf() ? -1 : 1
			);
			const latestMsg = sortedSeenMsgs[0];

			// update thread preview to mark latest messages as read
			// by function invoker
			batch.update(db.collection('threads').doc(threadId), {
				latestMessage: latestMsg.content,
				latestTime: latestMsg.time,
				latestSenderUid: latestMsg.sender.uid,
				latestSeenAt: latestMsg.seenAt,
			});

			try {
				await batch.commit();
				logger.log(
					`Marked messages as seen and updated thread preview: ${threadId}/${seenMessages
						.map((x) => x.id)
						.join(', ')}`
				);
			} catch (error) {
				logger.error(error);
				throw new functions.https.HttpsError(
					'internal',
					`Fail to read messages: ${threadId}`,
					error
				);
			}
		} else {
			logger.log(`No messages to be seen`);
		}

		return 'ok';
	}
);

export default readMessages;
