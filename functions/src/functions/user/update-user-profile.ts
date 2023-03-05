import { ERROR_MESSAGES } from '../../constants';
import { Logger } from '../../services/logger';
import { Firebase } from '../../services/firebase';
import { Utils } from '../../utils/utils';
import { UpdateUserProfileRequest } from '../../models/requests/user/update-user-profile-request';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { Collection } from '../../models/collection-name';

export const updateUserProfile = Firebase.functions.https.onCall(
	async (data: unknown, context) => {
		try {
			console.log(data);

			// parse incoming data
			const requestData = UpdateUserProfileRequest.parse(data);

			// authorize user
			const invokerUid = Utils.isLoggedIn(context);

			const invoker = await Utils.fetchUser(invokerUid);

			Utils.isNotBanned(invoker);

			// update user profile
			const updateValue: Record<string, string | string[]> = {};
			if (requestData.imageUrl) updateValue['photoURL'] = requestData.imageUrl;
			if (requestData.bio) updateValue['bio'] = requestData.bio;
			if (requestData.pronouns) updateValue['pronouns'] = requestData.pronouns;

			try {
				await Firebase.db
					.collection(Collection.users)
					.doc(invoker.uid)
					.update(updateValue);
				Logger.log(`Updated user profile in database: ${invoker.uid}`);
				if (requestData.imageUrl) {
					await Firebase.auth.updateUser(invoker.uid, {
						photoURL: requestData.imageUrl,
					});
					Logger.log(`Updated user profile in firebase: ${invoker.uid}`);
				}
			} catch (error) {
				Logger.error(error);
				Logger.error(`Fail to update user profile: ${invoker.uid}`);
				throw new Firebase.functions.https.HttpsError(
					'internal',
					ERROR_MESSAGES.failUpdateUserProfile
				);
			}
			return ConfirmationResponse.parse();
		} catch (error) {
			throw Utils.cloudFunctionHandler(error);
		}
	}
);
