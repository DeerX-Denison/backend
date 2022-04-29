import { MessageData } from 'types';
import { db } from '../firebase.config';
import Logger from '../Logger';
const logger = new Logger();

/**
 * utility function to fetch user info from a given uid
 */
const fetchMessage: (
	messageId: string,
	threadId: string
) => Promise<MessageData | undefined> = async (messageId, threadId) => {
	const docSnap = await db
		.collection('threads')
		.doc(threadId)
		.collection('messages')
		.doc(messageId)
		.get();
	if (!docSnap.exists) {
		logger.log(`message not exist: ${threadId}/${messageId}`);
		return undefined;
	}
	const messageData = docSnap.data() as MessageData;
	logger.log(`Fetched message: ${threadId}/${messageId}`);
	return messageData;
};
export default fetchMessage;
