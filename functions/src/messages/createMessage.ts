import * as functions from 'firebase-functions';
import { DEFAULT_MESSAGE_NAME, DEFAULT_USER_PHOTO_URL } from '../constants';
import { db, svTime, Timestamp } from '../firebase.config';
import Logger from '../Logger';
import {
	MessageData,
	ThreadName,
	ThreadPreviewData,
	ThreadThumbnail,
} from '../types';
import { fetchUserInfo } from '../utils';
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

		// fetch updated members from membersUid
		const members = await Promise.all(
			threadPreviewData.membersUid.map(async (uid) => await fetchUserInfo(uid))
		);

		const name: ThreadName = {};
		const thumbnail: ThreadThumbnail = {};
		members.forEach((member) => {
			const otherMember = members.filter((x) => x.uid !== member.uid)[0];
			name[member.uid] = otherMember.displayName
				? otherMember.displayName
				: DEFAULT_MESSAGE_NAME;
			thumbnail[member.uid] = otherMember.photoURL
				? otherMember.photoURL
				: DEFAULT_USER_PHOTO_URL;
		});

		const newMessage: MessageData = {
			...message,
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
