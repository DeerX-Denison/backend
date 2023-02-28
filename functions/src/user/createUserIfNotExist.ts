import { AuthData } from 'firebase-functions/lib/common/providers/https';
import { UserData } from 'types';
import {
	DEFAULT_GUEST_DISPLAY_NAME,
	DEFAULT_GUEST_EMAIL,
	DEFAULT_GUEST_PHOTO_URL,
	DEFAULT_USER_DISPLAY_NAME,
	DEFAULT_USER_PHOTO_URL,
} from '../constants';
import Logger from '../Logger';
import { getAllSubstrings } from '../utils';
import userNameAndPhoto from './users.json';
import { Firebase } from '../services/firebase';

const logger = new Logger();

// updated users must have this type
type UpdatedUser = {
	uid: string;
	email: string;
	displayName: string;
	photoURL: string;
	searchableKeyword: string[];
};

// typing of the user file that maps displayName and photoURL
type UserFile = {
	[key: string]: { img: string; name: string; email: string };
};

/**
 * check if current user data in db needs update (old data, admin introduces new sattelite data)
 */
const userNeedsUpdate = (user: UserData) => {
	if (!('displayName' in user)) {
		return true;
	}
	if (user['displayName'] === null) {
		return true;
	}
	if (!('photoURL' in user)) {
		return true;
	}
	if (user['photoURL'] === null) {
		return true;
	}

	// added on Dec 2022
	if (!('searchableKeyword' in user)) {
		return true;
	}

	// added on Jan 15, 2022
	// modified on April 27, 2022
	// add ? to supprose ts warning. Already check for "photoURL" in user above
	if (
		user['photoURL']?.includes('=s36') ||
		user['photoURL']?.includes('/s36')
	) {
		return true;
	}

	if (!('disabled' in user)) {
		return true;
	}

	return false;
};

/**
 * accesss user.json and query for the user's displayName and photoURL
 */
const updateUser = (userInfo: AuthData) => {
	const { token } = userInfo;
	let email: string;
	try {
		if (token.email) {
			email = token.email;
		} else {
			if (token.firebase.sign_in_provider !== 'anonymous') {
				throw 'Non-anoymous user email is null';
			}
			email = DEFAULT_GUEST_EMAIL;
		}
	} catch (error) {
		throw new Firebase.functions.https.HttpsError(
			'permission-denied',
			'User does not have permission',
			error
		);
	}
	const bigRedId = email.split('@')[0];
	const searchableKeyword = getAllSubstrings(bigRedId);
	const userFile: UserFile = userNameAndPhoto;

	let displayName: string;
	let photoURL: string;

	if (email in userFile) {
		if ('name' in userFile[email]) {
			displayName = userFile[email].name;
		} else {
			displayName = DEFAULT_USER_DISPLAY_NAME;
		}
		if ('img' in userFile[email]) {
			photoURL = userFile[email].img;
		} else {
			photoURL = DEFAULT_USER_PHOTO_URL;
		}
	} else if (token.firebase.sign_in_provider === 'anonymous') {
		displayName = DEFAULT_GUEST_DISPLAY_NAME;
		photoURL = DEFAULT_GUEST_PHOTO_URL;
	} else {
		displayName = DEFAULT_USER_DISPLAY_NAME;
		photoURL = DEFAULT_USER_PHOTO_URL;
	}

	const updatedUser: UpdatedUser = {
		uid: token.uid,
		email,
		displayName,
		photoURL,
		searchableKeyword,
	};

	return updatedUser;
};

/**
 * Deprecated. This function has been upgrade to "syncUser".
 * It will be removed in future updates.
 */
const createUserIfNotExist = Firebase.functions.https.onCall(
	async (_data, context) => {
		if (!context.auth) {
			throw new Firebase.functions.https.HttpsError(
				'unauthenticated',
				'User is not authenticated'
			);
		}
		if (context.auth.token.email) {
			if (context.auth.token.email_verified) {
				if (
					!(
						context.auth.token.email.endsWith('@denison.edu') ||
						context.auth.token.email === 'deerx.test@gmail.com' ||
						context.auth.token.email === 'deerx.dev@gmail.com'
					)
				) {
					logger.log(
						`User login with invalid email: ${context.auth.uid}/${context.auth.token.email}`
					);
					throw new Firebase.functions.https.HttpsError(
						'permission-denied',
						'The user does not have permission'
					);
				}
			} else {
				logger.log(
					`User login with unverified email: ${context.auth.uid}/${context.auth.token.email}`
				);
				throw new Firebase.functions.https.HttpsError(
					'permission-denied',
					'The user does not have permission'
				);
			}
		} else {
			if (context.auth.token.firebase.sign_in_provider !== 'anonymous') {
				logger.log(
					`Non-anonymous user login without email: ${context.auth.uid}/${context.auth.token.email}`
				);
				throw new Firebase.functions.https.HttpsError(
					'permission-denied',
					'The user does not have permission'
				);
			} else {
				logger.log(`User login anonymously: ${context.auth.uid}`);
			}
		}

		const updatedUser = updateUser(context.auth);

		const docSnap = await Firebase.db
			.collection('users')
			.doc(context.auth.uid)
			.get();
		if (!docSnap.exists) {
			try {
				await Firebase.db
					.collection('users')
					.doc(context.auth.uid)
					.set({ ...updatedUser, disabled: false });
				logger.log(`Created user: ${context.auth.uid}`);
				return 'created';
			} catch (error) {
				logger.error(error);
				logger.error(`Fail to create user: ${context.auth.uid}`);
				return 'error';
			}
		} else {
			const user = docSnap.data() as UserData;
			if (userNeedsUpdate(user)) {
				try {
					await Firebase.db
						.collection('users')
						.doc(context.auth.uid)
						.set({
							...updatedUser,
							disabled: user.disabled ? user.disabled : false,
						});
					logger.log(`Updated user: ${context.auth.uid}`);
					return 'updated';
				} catch (error) {
					logger.log(error);
					logger.error(`Fail to update user: ${context.auth.uid}`);
					return 'error';
				}
			} else {
				return 'exist';
			}
		}
	}
);
export default createUserIfNotExist;
