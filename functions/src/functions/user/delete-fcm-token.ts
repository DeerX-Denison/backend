import { Firebase } from '../../services/firebase';
import { Config } from '../../config';
import { InternalError } from '../../models/error/internal-error';
import { Utils } from '../../utils/utils';
import { Logger } from '../../services/logger';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { DeleteFCMTokenRequest } from '../../models/requests/user/delete-fcm-token-request';
import { AuthError } from '../../models/error/auth-error';

export const deleteFCMToken = Firebase.functions
	.region(...Config.regions)
	.https.onCall(async (data: unknown, context) => {
		try {
			// parse incoming data
			const requestData = DeleteFCMTokenRequest.parse(data);

			// authorize user
			const invokerId = Utils.isLoggedIn(context);

			if (invokerId !== requestData.uid) throw new AuthError();

			const invoker = await Utils.fetchUser(invokerId);

			Utils.isNotBanned(invoker);

			// update database
			try {
				await Firebase.db
					.collection('users')
					.doc(invoker.uid)
					.collection('fcm_tokens')
					.doc(requestData.deviceId)
					.delete();
				Logger.log(`Deleted FCM Token: ${invoker.uid}/${requestData.deviceId}`);
			} catch (error) {
				throw new InternalError();
			}

			// parse response
			return ConfirmationResponse.parse();
		} catch (error) {
			throw Utils.cloudFunctionHandler(error);
		}
	});
