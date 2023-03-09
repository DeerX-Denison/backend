import { Thread } from '../../models/thread/thread';
import { Message } from '../../models/message/message';
import { CreateMessageRequest } from '../../models/requests/message/create-message-request';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { User } from '../../models/user/user';
import { CloudFunction } from '../../services/cloud-functions';

export const createMessage = CloudFunction.onCall(
	async (data: unknown, context) => {
		const invokerId = User.isLoggedIn(context);

		const invoker = await User.get(invokerId);

		User.isNotBanned(invoker);

		const requestData = CreateMessageRequest.parse(data);

		const thread = await Thread.get(requestData.threadPreviewData.id);

		User.isThreadMember(invoker, thread);

		await Message.create(thread, requestData.message, invoker);

		return ConfirmationResponse.parse();
	}
);
