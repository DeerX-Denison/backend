import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { DeleteFCMTokenRequest } from '../../models/requests/user/delete-fcm-token-request';
import { CloudFunction } from '../../services/cloud-functions';
import { User } from '../../models/user/user';
import { FCMToken } from '../../models/fcm-token/fcm-token';

export const deleteFCMToken = CloudFunction.onCall(
	async (data: unknown, context) => {
		const invokerId = User.isLoggedIn(context);

		const invoker = await User.get(invokerId);

		const requestData = DeleteFCMTokenRequest.parse(data);

		User.isNotBanned(invoker);

		await FCMToken.delete(invoker.uid, requestData.deviceId);

		return ConfirmationResponse.parse();
	}
);
