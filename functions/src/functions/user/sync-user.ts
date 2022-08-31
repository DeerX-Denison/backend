import * as functions from 'firebase-functions';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { Utils } from '../../utils/utils';
import {
	DEFAULT_GUEST_DISPLAY_NAME,
	DEFAULT_GUEST_EMAIL,
	DEFAULT_GUEST_PHOTO_URL,
	DEFAULT_USER_DISPLAY_NAME,
	DEFAULT_USER_PHOTO_URL,
} from '../../constants';
import userData from './users.json';
import { UserProfile } from 'models/user';
import { z } from 'zod';
import { Firebase } from 'services/firebase-service';
import { Collection } from 'models/collection-name';

export const syncUser = functions.https.onCall(
	async (data: unknown, context) => {
		try {
			// authorize user
			const invokerId = Utils.isLoggedIn(context);

			const invoker = await Utils.fetchUser(invokerId);

			Utils.isNotBanned(invoker);

			const isAnonymousUser = Utils.isAnonymousUser(context);

			// generate udpated user
			const email = isAnonymousUser
				? DEFAULT_GUEST_EMAIL
				: Utils.validEmail(context.auth);

			const bigRedId = email.split('@')[0];

			const searchableKeyword = Utils.getAllSubstrings(bigRedId);

			const displayName = isAnonymousUser
				? DEFAULT_GUEST_DISPLAY_NAME
				: email in userData
				? (userData as any)[email].name
				: DEFAULT_USER_DISPLAY_NAME;

			const photoURL = isAnonymousUser
				? DEFAULT_GUEST_PHOTO_URL
				: email in userData
				? (userData as any)[email].img
				: DEFAULT_USER_PHOTO_URL;

			const updatedUser = UserProfile.extend({
				searchableKeyword: z.array(z.string().min(1)),
			}).parse({
				uid: invokerId,
				email,
				displayName,
				photoURL,
				searchableKeyword,
			});

			// update firestore and auth db with synced user
			await Firebase.db
				.collection(Collection.users)
				.doc(invoker.uid)
				.update(updatedUser);
			await Firebase.auth.updateUser(invoker.uid, updatedUser);
		} catch (error) {
			return Utils.errorHandler(error);
		}
	}
);
