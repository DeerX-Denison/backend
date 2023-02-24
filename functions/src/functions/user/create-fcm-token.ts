import { Firebase } from '../../services/firebase';
import { Config } from '../../config';
import { InternalError } from '../../models/error/internal-error';
import { CreateFCMTokenRequest } from '../../models/requests/user/create-fcm-token-request';
import { Utils } from '../../utils/utils';
import { Logger } from '../../services/logger';
import { ConfirmationResponse } from '../../models/response/confirmation-response';

export const createFCMToken = Firebase.functions
	.region(...Config.regions)
	.https.onCall(async (data: unknown, context) => {
		try {
			// parse incoming data
			const requestData = CreateFCMTokenRequest.parse(data);

			// authorize user
			const invokerId = Utils.isLoggedIn(context);

			const invoker = await Utils.fetchUser(invokerId);

			Utils.isNotBanned(invoker);

			// update database
			try {
				await Firebase.db
					.collection('users')
					.doc(invoker.uid)
					.collection('fcm_tokens')
					.doc(requestData.deviceId)
					.set({
						...requestData,
						updatedAt: Firebase.serverTime(),
					});
				Logger.log(
					`Created FCM Token for user: ${invoker.uid}/${requestData.deviceId}`
				);
			} catch (error) {
				throw new InternalError();
			}

			// parse response
			return ConfirmationResponse.parse();
		} catch (error) {
			console.error(error);
			throw error;
		}
	});
