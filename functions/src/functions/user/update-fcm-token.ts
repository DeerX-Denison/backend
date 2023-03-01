import { Firebase } from '../../services/firebase';
import { Logger } from '../../services/logger';
import { UpdateFCMTokenRequest } from '../../models/requests/user/update-fcm-token-request';
import { Utils } from '../../utils/utils';
import { Collection } from '../../models/collection-name';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { InternalError } from '../../models/error/internal-error';

export const updateFCMToken = Firebase.functions.https.onCall(
	async (data: unknown, context) => {
		try {
			const requestData = UpdateFCMTokenRequest.parse(data);

			const invokerUid = Utils.isLoggedIn(context);

			const invoker = await Utils.fetchUser(invokerUid);

			Utils.isNotBanned(invoker);

			try {
				await Firebase.db
					.collection('users')
					.doc(invoker.uid)
					.collection(Collection.fcm_tokens)
					.doc(requestData.deviceId)
					.update({
						token: requestData.token,
						updatedAt: Firebase.serverTime(),
					});
				Logger.log(`Updated FCM Token: ${invokerUid}/${requestData.deviceId}`);
			} catch (error) {
				Logger.error(error);
				Logger.error(
					`Fail to update fcm token: ${invokerUid}/${requestData.deviceId}`
				);
				throw new InternalError(error);
			}

			return ConfirmationResponse.parse();
		} catch (error) {
			throw Utils.cloudFunctionHandler(error);
		}
	}
);
