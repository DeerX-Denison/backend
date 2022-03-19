import { messaging } from 'firebase-admin';
import * as functions from 'firebase-functions';
import { MessageData, MessageId, ThreadId, UserFCMTokenData } from 'types';
import { db, msg } from '../firebase.config';
import Logger from '../Logger';

const logger = new Logger();

/**
 * function to fetch all fcm token of the provided uid
 */
const fetchFCMTokensFromUid = async (uid: string) => {
	try {
		const querySnap = await db
			.collection('users')
			.doc(uid)
			.collection('fcm_tokens')
			.get();
		const tokens: UserFCMTokenData[] = querySnap.docs.map(
			(docSnap) => docSnap.data() as UserFCMTokenData
		);
		return tokens;
	} catch (error) {
		logger.error(`Can't fetch fcm token of uid: ${uid}`);
		throw logger.error(error);
	}
};

/**
 * construct and return a multicast message to be sent from input message data, all token of the provided uid
 */
const constructNoti = (message: MessageData, tokens: string[], uid: string) => {
	if (message.contentType === 'text') {
		const title = message.threadName[uid];
		const body = message.content;
		const noti: messaging.MulticastMessage = {
			notification: { title, body },
			apns: {
				payload: {
					aps: {
						alert: {
							body,
							title,
						},
						badge: 0,
						sound: ' default',
					},
				},
			},
			tokens,
		};
		return noti;
	} else {
		throw 'Not implemented';
	}
};

/**
 * sends notification to all receivers of the newly created message
 * error codes:
 * 0: Can't fetch all token from all receivers
 * 1: Can't send notification to all receivers
 */
const sendNotification = async (
	message: MessageData,
	threadId: ThreadId,
	messageId: MessageId
) => {
	const { membersUid, sender } = message;
	const notSelfUids = membersUid.filter((uid) => uid !== sender.uid);
	if (notSelfUids.length > 0) {
		notSelfUids.forEach(async (uid) => {
			const tokensData = await fetchFCMTokensFromUid(uid);
			const tokens = tokensData.map((tokenData) => tokenData.token);
			const noti = constructNoti(message, tokens, uid);
			try {
				const { responses, successCount, failureCount } =
					await msg.sendMulticast(noti);
				logger.log(`successCount: ${successCount}`);
				logger.log(`failureCount: ${failureCount}`);
				logger.log(responses);
			} catch (error) {
				throw logger.error(
					`[ERROR 1]: Can't send notification to all receivers: ${threadId}/${messageId}`
				);
			}
		});
	}
};

const updateThreadPreview = async (
	newMessage: MessageData,
	threadId: string
) => {
	// update threads/
	// const latestSeenAt: ThreadLatestSeenAt = {};
	// newMessage.membersUid.forEach((uid) => {
	// 	console.log(newMessage.seenAt);
	// 	const seconds = newMessage.seenAt[uid]?.seconds;
	// 	const nanoseconds = newMessage.seenAt[uid]?.nanoseconds;
	// 	// console.log(seconds, nanoseconds);
	// 	if (seconds && nanoseconds) {
	// 		latestSeenAt[uid] = new admin.firestore.Timestamp(seconds, nanoseconds);
	// 	}
	// });
	try {
		await db.collection('threads').doc(threadId).update({
			latestMessage: newMessage.content,
			latestTime: newMessage.time,
			latestSenderUid: newMessage.sender.uid,
			latestSeenAt: newMessage.seenAt,
		});
	} catch (error) {
		throw logger.error(error);
	}
};

/**
 * handles when a message is created
 */
const onCreateMessage = functions.firestore
	.document('threads/{threadId}/messages/{messageId}')
	.onCreate(
		async (
			snapshot: functions.firestore.QueryDocumentSnapshot,
			context: functions.EventContext
		) => {
			const message = snapshot.data() as MessageData;
			const { threadId, messageId } = context.params;
			try {
				await updateThreadPreview(message, threadId);
			} catch (error) {
				logger.error(error);
				return 'error';
			}
			try {
				await sendNotification(message, threadId, messageId);
			} catch (error) {
				logger.error(error);
				return 'error';
			}
			return 'ok';
		}
	);

export default onCreateMessage;
