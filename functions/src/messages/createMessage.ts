import * as functions from 'firebase-functions';
import { MessageData, ThreadPreviewData } from 'types';
import { db, svTime, Timestamp } from '../firebase.config';
import Logger from '../Logger';
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
		const sender = await fetchUser(message.sender.uid);

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
			await sendNoti(newMessage, threadPreviewData.id, newMessage.id);
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
