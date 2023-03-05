import { Logger } from '../../services/logger';
import { Firebase } from '../../services/firebase';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { Utils } from '../../utils/utils';
import { InternalError } from '../../models/error/internal-error';
import { Collection } from '../../models/collection-name';

export const deleteUser = Firebase.functions.https.onCall(
	async (_data, context) => {
		try {
			const invokerId = Utils.isLoggedIn(context);

			const invoker = await Utils.fetchUser(invokerId);

			Utils.isNotBanned(invoker);

			try {
				await Firebase.auth.deleteUser(invoker.uid);
				Logger.log(`Deleted user from auth: ${invoker.uid}`);
			} catch (error) {
				throw new InternalError(error);
			}

			try {
				await Firebase.db.recursiveDelete(
					Firebase.db.collection(Collection.users).doc(invoker.uid)
				);
				Logger.log(`Recursively deleted member id ${invoker.uid}`);
			} catch (error) {
				throw new InternalError(error);
			}

			return ConfirmationResponse.parse();
		} catch (error) {
			throw Utils.cloudFunctionHandler(error);
		}
	}
);
