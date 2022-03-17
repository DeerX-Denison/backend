import { MessageData, UserInfo } from 'types';
import { db } from '../firebase.config';

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
	const messageData = docSnap.data() as MessageData;
	return messageData;
};
export default fetchMessage;
