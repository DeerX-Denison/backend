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

		if (message.membersUid.length !== 2) {
			throw new functions.https.HttpsError(
				'invalid-argument',
				'membersUid does not have length 2'
			);
		}
		if (!threadPreviewData.membersUid.includes(context.auth.uid)) {
			throw new functions.https.HttpsError(
				'permission-denied',
				"Invoker is not thread's member"
			);
		}

		if (!threadPreviewData.id.includes(context.auth.uid)) {
			throw new functions.https.HttpsError(
				'permission-denied',
				"Invoker is not thread's member (id)"
			);
		}

		// fetch updated members from membersUid
		const members = await Promise.all(
			threadPreviewData.membersUid.map(async (uid) => await fetchUserInfo(uid))
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
				throw new functions.https.HttpsError(
					'invalid-argument',
					'other members length is < 0'
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
			throw new functions.https.HttpsError(
				'internal',
				`Fail to create new message and update thread preview data: ${threadPreviewData.id}/${newMessage.id}`,
				error
			);
		}
		try {
			await sendNoti(newMessage, threadPreviewData.id, newMessage.id, members);
			logger.log(
				`Sent notification to [${members.map((x) => x.uid).join(', ')}]`
			);
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
