import { Firebase } from '../../services/firebase';
import { ReadMessageRequest } from '../../models/requests/message/read-message-request';
import { Message } from '../../models/message/message';
import { ReadMessageResponse } from '../../models/response/message/read-message-response';
import { User } from '../../models/user/user';

export const readMessages = Firebase.functions.https.onCall(
	async (data: unknown, context) => {
		const invokerId = User.isLoggedIn(context);

		const invoker = await User.get(invokerId);

		User.isNotBanned(invoker);

		const requestData = ReadMessageRequest.parse(data);

		// messages that has not been read by function invoker
		const tobeSeenMessages = await Message.getMany(
			requestData.threadId,
			requestData.messageIds
		);

		await Message.markManyAsRead(
			invoker.uid,
			requestData.threadId,
			tobeSeenMessages
		);

		return ReadMessageResponse.ok;
	}
);
