import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { CloudFunction } from '../../services/cloud-functions';
import { User } from '../../models/user/user';

export const deleteUser = CloudFunction.onCall(async (_, context) => {
	const invokerId = User.isLoggedIn(context);

	const invoker = await User.get(invokerId);

	User.isNotBanned(invoker);

	await User.delete(invoker.uid);

	return ConfirmationResponse.parse();
});
