import { Logger } from '../../services/logger';
import { Firebase } from '../../services/firebase';
import { Timestamp } from '../../models/timestamp';
import { ReadMessageRequest } from '../../models/requests/message/read-message-request';
import { Utils } from '../../utils/utils';
import { Message, MessageSeenAt } from '../../models/message';
import { ReadMessageResponse } from '../../models/response/message/read-message-response';

export const readMessages = Firebase.functions.https.onCall(
	async (data: unknown, context) => {
		// validate request data
		const requestData = ReadMessageRequest.parse(data);

		// authorize user
		const invokerId = Utils.isLoggedIn(context);

		const invoker = await Utils.fetchUser(invokerId);

		Utils.isNotBanned(invoker);

		// messages that has not been read by function invoker
		let tobeSeenMessages: Message[];
		try {
			tobeSeenMessages = (
				await Promise.all(
					requestData.messageIds.map(async (messageId) => {
						try {
							return await Utils.fetchMessage(requestData.threadId, messageId);
						} catch (error) {
							Logger.error(error);
							Logger.error(
								`Fail to fetch message: ${requestData.threadId}/${messageId}`
							);
							return undefined;
						}
					})
				)
			).filter((x) => x !== undefined) as Message[];
		} catch (error) {
			Logger.error(error);
			Logger.error(
				`Fail to fetch to-be-read messages: [${requestData.messageIds.join(
					', '
				)}]`
			);
			return ReadMessageResponse.error;
		}

		// transform messages that has not been read by function invoker
		// to messages that has been read by function invoker
		const seenMessages = tobeSeenMessages.map((msg) => {
			const parsedTime = new Timestamp(msg.time.seconds, msg.time.nanoseconds);

			const updatedSeenAt: MessageSeenAt = {};
			const nonReaderUids = msg.membersUid.filter((uid) => uid !== invoker.uid);
			nonReaderUids.forEach((uid) => {
				if ('seenAt' in msg && uid in msg['seenAt']) {
					if (msg['seenAt'][uid] !== null) {
						const seconds = msg.seenAt[uid]?.seconds;
						const nanoseconds = msg.seenAt[uid]?.nanoseconds;
						if (seconds && nanoseconds) {
							updatedSeenAt[uid] = new Timestamp(seconds, nanoseconds);
						}
					} else {
						updatedSeenAt[uid] = null;
					}
				}
			});
			updatedSeenAt[invoker.uid] = Firebase.serverTime() as Timestamp;
			return {
				...msg,
				time: parsedTime,
				seenAt: updatedSeenAt,
			};
		});

		// if there are messages that needs to be seen
		if (seenMessages.length > 0) {
			const batch = Firebase.db.batch();

			// mark messages as read by function invoker
			seenMessages.forEach((msg) => {
				batch.update(
					Firebase.db
						.collection('threads')
						.doc(requestData.threadId)
						.collection('messages')
						.doc(msg.id),
					msg
				);
			});

			// get latest message
			const sortedSeenMsgs: Message[] = seenMessages.sort((a, b) =>
				a.time.valueOf() > b.time.valueOf() ? -1 : 1
			);
			const latestMsg = sortedSeenMsgs[0];

			// update thread preview to mark latest messages as read
			// by function invoker
			batch.update(
				Firebase.db.collection('threads').doc(requestData.threadId),
				{
					latestMessage: latestMsg.content,
					latestTime: latestMsg.time,
					latestSenderUid: latestMsg.sender.uid,
					latestSeenAt: latestMsg.seenAt,
				}
			);

			try {
				await batch.commit();
				Logger.log(
					`Marked messages as seen and updated thread preview: ${
						requestData.threadId
					}/${seenMessages.map((x) => x.id).join(', ')}`
				);
			} catch (error) {
				Logger.error(error);
				throw new Firebase.functions.https.HttpsError(
					'internal',
					`Fail to read messages: ${requestData.threadId}`,
					error
				);
			}
		} else {
			Logger.log(`No messages to be seen`);
		}

		return ReadMessageResponse.ok;
	}
);
