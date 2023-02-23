import { Utils } from '../../utils/utils';
import {
	DEFAULT_USER_DISPLAY_NAME,
	DEFAULT_USER_PHOTO_URL,
} from '../../constants';
import userData from './users.json';
import { User, UserProfile } from '../../models/user';
import { z } from 'zod';
import { Firebase } from '../../services/firebase-service';
import { Collection } from '../../models/collection-name';
import { AuthError } from '../../models/error/auth-error';
import { NotFoundError } from '../../models/error/not-found-error';

export const syncUser = Firebase.functions.https.onCall(async (_, context) => {
	try {
		// authorize user
		const invokerId = Utils.isLoggedIn(context);

		if (Utils.isAnonymousUser(context)) throw new AuthError();

		let invoker: User;
		try {
			invoker = await Utils.fetchUser(invokerId);
			if (invoker) Utils.isNotBanned(invoker);
		} catch (error) {
			if (!(error instanceof NotFoundError)) throw error;
		}

		// generate udpated user
		const email = Utils.validEmail(context.auth);

		const communityId = email.split('@')[0];

		const searchableKeyword = Utils.getAllSubstrings(communityId);

		const displayName =
			email in userData
				? (userData as any)[email].name
				: DEFAULT_USER_DISPLAY_NAME;

		const photoURL =
			email in userData ? (userData as any)[email].img : DEFAULT_USER_PHOTO_URL;

		const updatedUser = UserProfile.extend({
			searchableKeyword: z.array(z.string().min(1)),
		}).parse({
			uid: invokerId,
			email,
			displayName,
			photoURL,
			searchableKeyword,
		});

		// update firestore and auth db with synced user if invoker exist
		await Firebase.db
			.collection(Collection.users)
			.doc(invokerId)
			.set(updatedUser);

		await Firebase.auth.updateUser(invokerId, {
			...updatedUser,
			email: updatedUser.email ? updatedUser.email : undefined,
		});

		return 'updated';
	} catch (error) {
		console.error(error);
		return 'error';
	}
});
