import { Thread } from '../../models/thread/thread';
import { CreateThreadRequest } from '../../models/requests/thread/create-thread-request';
import { CreateThreadResponse } from '../../models/response/thread/create-thread-response';
import { CloudFunction } from '../../services/cloud-functions';
import { User } from '../../models/user/user';

export const createThread = CloudFunction.onCall(
	async (data: unknown, context) => {
		const invokerId = User.isLoggedIn(context);

		const invoker = await User.get(invokerId);

		User.isNotBanned(invoker);

		const requestData = CreateThreadRequest.parse(data);

		await Thread.create(requestData.id, requestData.membersUid, invoker);

		const newRoom = await Thread.get(requestData.id);

		return CreateThreadResponse.parse({ room: newRoom });
	}
);
