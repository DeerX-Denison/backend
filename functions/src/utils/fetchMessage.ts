import { MessageData, UserInfo } from 'types';
import { db } from '../firebase.config';
import Logger from '../Logger';
const logger = new Logger();

export type UserData = {
	searchableKeyword: string[];
} & UserInfo;

/**
 * utility function to fetch user info from a given uid
 */
const fetchMessage: (
	messageId: string,
	threadId: string
) => Promise<MessageData> = async (messageId, threadId) => {
	const docSnap = await db
		.collection('threads')
		.doc(threadId)
		.collection('messages')
		.doc(messageId)
		.get();
	if (!docSnap.exists) throw `message not exist: ${threadId}/${messageId}`;
	const messageData = docSnap.data() as MessageData;
	logger.log(`Fetched message: ${threadId}/${messageId}`);
	return messageData;
};
export default fetchMessage;
