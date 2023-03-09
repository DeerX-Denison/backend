import { CreateFCMTokenRequest } from '../../models/requests/user/create-fcm-token-request';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { CloudFunction } from '../../services/cloud-functions';
import { User } from '../../models/user/user';
import { FCMToken } from '../../models/fcm-token/fcm-token';

export const createFCMToken = CloudFunction.onCall(
	async (data: unknown, context) => {
		const invokerId = User.isLoggedIn(context);

		const invoker = await User.get(invokerId);

		User.isNotBanned(invoker);

		const requestData = CreateFCMTokenRequest.parse(data);

		await FCMToken.create(invoker.uid, requestData.deviceId, requestData.token);

		return ConfirmationResponse.parse();
	}
);
