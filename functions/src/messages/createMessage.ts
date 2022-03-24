import * as functions from 'firebase-functions';
import { DEFAULT_MESSAGE_NAME, DEFAULT_SELF_MESSAGE_NAME } from '../constants';
import { db, svTime, Timestamp } from '../firebase.config';
import Logger from '../Logger';
import { MessageData, ThreadName, ThreadPreviewData, UserInfo } from '../types';
import { fetchUser } from '../utils';
import sendNoti from './sendNoti';
const logger = new Logger();
type Data = {
	threadPreviewData: ThreadPreviewData;
	message: MessageData;
};
const createMessage = functions.https.onCall(
	async ({ threadPreviewData, message }: Data, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}
		const { sender, membersUid } = message;
		const otherMemberUid = membersUid.filter((x) => x !== sender.uid)[0];

		const name: ThreadName = {};
		let members: UserInfo[] = [];

		if (otherMemberUid && otherMemberUid.length > 0) {
			const otherMember = await fetchUser(otherMemberUid);

			name[sender.uid] = otherMember.displayName
				? otherMember.displayName
				: DEFAULT_SELF_MESSAGE_NAME;
			name[otherMember.uid] = sender.displayName
				? sender.displayName
				: DEFAULT_MESSAGE_NAME;
			members = [sender, otherMember];
		} else {
			name[sender.uid] = DEFAULT_SELF_MESSAGE_NAME;
			members = [sender, sender];
		}

		const newMessage: MessageData = {
			...message,
			sender,
			time: svTime() as Timestamp,
			seenAt: {
				...message.seenAt,
				[sender.uid]: svTime() as Timestamp,
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
		});

		try {
			await batch.commit();
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				`Fail to create new message with id: ${newMessage.id}`,
				error
			);
		}
		try {
			await sendNoti(newMessage, threadPreviewData.id, newMessage.id, members);
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				`Fail to send notification for message id: ${newMessage.id}`,
				error
			);
		}

		return 'ok';
	}
);

export default createMessage;
