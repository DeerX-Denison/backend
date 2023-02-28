import { ERROR_MESSAGES } from '../../constants';
import { Logger } from '../../services/logger';
import { Firebase } from '../../services/firebase';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { Utils } from '../../utils/utils';

export const deleteUser = Firebase.functions.https.onCall(
	async (_data, context) => {
		const invokerId = Utils.isLoggedIn(context);

		const invoker = await Utils.fetchUser(invokerId);

		Utils.isNotBanned(invoker);

		try {
			await Firebase.auth.deleteUser(invoker.uid);
			Logger.log(`Deleted user from auth: ${invoker.uid}`);
		} catch (error) {
			Logger.error(error);
			Logger.error(`Fail to delete anonymous user from auth: ${invoker.uid}`);
			throw new Firebase.functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failDeleteAnonUser
			);
		}

		try {
			await Firebase.db.recursiveDelete(
				Firebase.db.collection('users').doc(invoker.uid)
			);
			Logger.log(`Recursively deleted member id ${invoker.uid}`);
		} catch (error) {
			Logger.error(error);
			Logger.error(
				`Fail to recursively delete anonymous user from db: ${invoker.uid}`
			);
			throw new Firebase.functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failDeleteAnonUser
			);
		}

		return ConfirmationResponse.parse();
	}
);
