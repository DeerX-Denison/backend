import { UpdateUserProfileRequest } from '../../models/requests/user/update-user-profile-request';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { CloudFunction } from '../../services/cloud-functions';
import { User, UserData } from '../../models/user/user';

export const updateUserProfile = CloudFunction.onCall(
	async (data: unknown, context) => {
		const invokerUid = User.isLoggedIn(context);

		const invoker = await User.get(invokerUid);

		User.isNotBanned(invoker);

		const requestData = UpdateUserProfileRequest.parse(data);

		const updateValue: Partial<UserData> = {};

		if (requestData.imageUrl) updateValue['photoURL'] = requestData.imageUrl;

		if (requestData.bio) updateValue['bio'] = requestData.bio;

		if (requestData.pronouns) updateValue['pronouns'] = requestData.pronouns;

		await User.update(invoker.uid, updateValue);

		return ConfirmationResponse.parse();
	}
);
