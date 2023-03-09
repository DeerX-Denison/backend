import { GetUserProfileRequest } from '../../models/requests/user/get-user-profile-request';
import { GetUserProfileResponse } from '../../models/response/user/get-user-profile-response';
import { CloudFunction } from '../../services/cloud-functions';
import { User } from '../../models/user/user';

export const getUserProfile = CloudFunction.onCall(
	async (data: unknown, context) => {
		const invokerId = User.isLoggedIn(context);

		const invoker = await User.get(invokerId);

		User.isNotBanned(invoker);

		const requestData = GetUserProfileRequest.parse(data);

		const targetUser = await User.get(requestData.uid);

		return GetUserProfileResponse.parse(targetUser);
	}
);
