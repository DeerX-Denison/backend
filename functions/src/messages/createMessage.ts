import * as functions from 'firebase-functions';
import { MessageData, ThreadPreviewData } from 'types';
import { db, svTime, Timestamp } from '../firebase.config';
import Logger from '../Logger';
import { fetchUser } from '../utils';
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

		try {
			await db
				.collection('threads')
				.doc(threadPreviewData.id)
				.collection('messages')
				.doc(message.id)
				.set(newMessage);
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				`Fail to create new message with id: ${newMessage.id}`,
				error
			);
		}
		return 'ok';
	}
);

export default createMessage;
