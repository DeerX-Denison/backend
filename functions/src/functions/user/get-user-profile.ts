import { Firebase } from '../../services/firebase';
import { Utils } from '../../utils/utils';
import { GetUserProfileRequest } from '../../models/requests/user/get-user-profile-request';
import { GetUserProfileResponse } from '../../models/response/user/get-user-profile-response';

export const getUserProfile = Firebase.functions.https.onCall(
	async (data: unknown, context) => {
		try {
			// parse incoming data
			const requestData = GetUserProfileRequest.parse(data);

			// authorize user
			const invokerId = Utils.isLoggedIn(context);

			const invoker = await Utils.fetchUser(invokerId);

			Utils.isNotBanned(invoker);

			// fetch target user
			const targetUser = await Utils.fetchUser(requestData.uid);

			return GetUserProfileResponse.parse(targetUser);
		} catch (error) {
			throw Utils.cloudFunctionHandler(error);
		}
	}
);
