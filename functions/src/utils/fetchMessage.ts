import { MessageData } from 'types';
import { db } from '../firebase.config';
import Logger from '../Logger';
const logger = new Logger();

/**
 * utility function to fetch user info from a given uid
 */
const fetchMessage: (
	threadId: string,
	messageId: string
) => Promise<MessageData | undefined> = async (threadId, messageId) => {
	try {
		const docSnap = await db
			.collection('threads')
			.doc(threadId)
			.collection('messages')
			.doc(messageId)
			.get();
		if (!docSnap.exists) {
			logger.log(`Message does not exist: ${threadId}/${messageId}`);
			return undefined;
		}
		const messageData = docSnap.data() as MessageData;
		return messageData;
	} catch (error) {
		logger.error(error);
		return undefined;
	}
};
export default fetchMessage;
