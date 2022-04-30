import * as functions from 'firebase-functions';
import {
	DEFAULT_MESSAGE_NAME,
	DEFAULT_USER_PHOTO_URL,
	ERROR_MESSAGES,
} from '../constants';
import { db, svTime, Timestamp } from '../firebase.config';
import Logger from '../Logger';
import {
	MessageData,
	ThreadName,
	ThreadPreviewData,
	ThreadThumbnail,
} from '../types';
import { fetchUserInfo, isLoggedIn, isNotBanned } from '../utils';
import sendNoti from './sendNoti';
const logger = new Logger();
type Data = {
	threadPreviewData: ThreadPreviewData;
	message: MessageData;
};
const createMessage = functions.https.onCall(
	async ({ threadPreviewData, message }: Data, context) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);

		if (message.membersUid.length !== 2) {
			logger.log(
				`membersUid does not have length 2: ${threadPreviewData.id}/${message.id}`
			);
			throw new functions.https.HttpsError(
				'invalid-argument',
				ERROR_MESSAGES.invalidInput
			);
		}
		if (!threadPreviewData.membersUid.includes(invoker.uid)) {
			logger.log(
				`Invoker (${invoker.uid}) is not thread's member: ${threadPreviewData.id}`
			);
			throw new functions.https.HttpsError(
				'permission-denied',
				ERROR_MESSAGES.notThreadMember
			);
		}

		if (!threadPreviewData.id.includes(invoker.uid)) {
			logger.log(
				`Invoker (${invoker.uid}) is not thread's member (id): ${threadPreviewData.id}`
			);
			throw new functions.https.HttpsError(
				'permission-denied',
				ERROR_MESSAGES.notThreadMember
			);
		}

		const threadCreator = threadPreviewData.members.find(
			(x) => x.uid === context.auth?.uid
		);
		if (!threadCreator) {
			logger.log(
				`Invoker (${invoker.uid}) is not thread's member (thread creator): ${threadPreviewData.id}`
			);
			throw new functions.https.HttpsError(
				'permission-denied',
				ERROR_MESSAGES.notThreadMember
			);
		}

		// fetch updated members from membersUid
		const members = await Promise.all(
			threadPreviewData.membersUid.map(async (uid) => {
				if (uid === invoker.uid) return invoker;
				return await fetchUserInfo(uid);
			})
		);

		const sender = members.filter((x) => x.uid === context.auth?.uid)[0];
		const name: ThreadName = {};
		const thumbnail: ThreadThumbnail = {};
		members.forEach((member) => {
			const otherMembers = members.filter((x) => x.uid !== member.uid);
			if (otherMembers.length > 0) {
				const otherMember = otherMembers[0];
				name[member.uid] = otherMember.displayName
					? otherMember.displayName
					: DEFAULT_MESSAGE_NAME;
				thumbnail[member.uid] = otherMember.photoURL
					? otherMember.photoURL
					: DEFAULT_USER_PHOTO_URL;
			} else if (otherMembers.length === 0) {
				const self = members.filter((x) => x.uid === context.auth?.uid)[0];
				name[self.uid] = self.displayName
					? self.displayName
					: DEFAULT_MESSAGE_NAME;
				thumbnail[self.uid] = self.photoURL
					? self.photoURL
					: DEFAULT_USER_PHOTO_URL;
			} else {
				logger.error('other members length is < 0');
				throw new functions.https.HttpsError(
					'invalid-argument',
					ERROR_MESSAGES.invalidInput
				);
			}
		});

		const newMessage: MessageData = {
			...message,
			sender,
			time: svTime() as Timestamp,
			seenAt: {
				...message.seenAt,
				[message.sender.uid]: svTime() as Timestamp,
			},
		};

		const batch = db.batch();
		batch.set(
			db
				.collection('threads')
				.doc(threadPreviewData.id)
				.collection('messages')
				.doc(message.id),
			newMessage
		);
		batch.update(db.collection('threads').doc(threadPreviewData.id), {
			latestMessage: newMessage.content,
			latestTime: newMessage.time,
			latestSenderUid: newMessage.sender.uid,
			latestSeenAt: newMessage.seenAt,
			name,
			thumbnail,
		});

		try {
			await batch.commit();
			logger.log(
				`Created message and updated thread preview data: ${threadPreviewData.id}/${newMessage.id}`
			);
		} catch (error) {
			logger.error(error);
			logger.error(
				`Fail to create new message and update thread preview data: ${threadPreviewData.id}/${newMessage.id}`
			);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failCreateMessage
			);
		}
		try {
			await sendNoti(newMessage, threadPreviewData.id, newMessage.id, members);
			logger.log(
				`Sent notification to [${members.map((x) => x.uid).join(', ')}]`
			);
		} catch (error) {
			logger.error(error);
			logger.error(
				`Fail to send notification for message id: ${newMessage.id}`
			);
			// throw new functions.https.HttpsError('internal', ERROR_MESSAGES.internal);
		}

		return 'ok';
	}
);

export default createMessage;
