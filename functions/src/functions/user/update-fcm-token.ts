import { UpdateFCMTokenRequest } from '../../models/requests/user/update-fcm-token-request';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { CloudFunction } from '../../services/cloud-functions';
import { User } from '../../models/user/user';
import { FCMToken } from '../../models/fcm-token/fcm-token';

export const updateFCMToken = CloudFunction.onCall(
	async (data: unknown, context) => {
		const invokerUid = User.isLoggedIn(context);

		const invoker = await User.get(invokerUid);

		User.isNotBanned(invoker);

		const requestData = UpdateFCMTokenRequest.parse(data);

		await FCMToken.update(invoker.uid, requestData.deviceId, requestData.token);

		return ConfirmationResponse.parse();
	}
);
