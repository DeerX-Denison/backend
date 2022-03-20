import { MessageData } from 'types';
import { db } from '../firebase.config';
import Logger from '../Logger';
const logger = new Logger();

const updateThreadPreview = async (
	newMessage: MessageData,
	threadId: string
) => {
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
export default updateThreadPreview;
