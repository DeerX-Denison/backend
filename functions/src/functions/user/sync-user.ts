import { User, UserData } from '../../models/user/user';
import { NotFoundError } from '../../models/error/not-found-error';
import { CloudFunction } from '../../services/cloud-functions';

export const syncUser = CloudFunction.onCall(async (_, context) => {
	const invokerId = User.isLoggedIn(context);

	// get user, if user not exist, create user in firestore
	let invoker: UserData;
	try {
		invoker = await User.get(invokerId);
		if (invoker) User.isNotBanned(invoker);
	} catch (error) {
		if (!(error instanceof NotFoundError)) throw error;
	}

	const email = User.validEmail(context.auth);

	await User.sync(invokerId, email);

	return 'updated';
});
