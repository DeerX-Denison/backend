import * as functions from 'firebase-functions';
import { AuthData } from 'firebase-functions/lib/common/providers/https';
import {
	DEFAULT_USER_DISPLAY_NAME,
	DEFAULT_USER_PHOTO_URL,
} from '../constants';
import { db } from '../firebase.config';
import Logger from '../Logger';
import userNameAndPhoto from './users.json';

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

const getAllSubstrings = (str: string | undefined) => {
	const substrings: string[] = [];
	if (str) {
		for (let i = 0; i < str.length; i++) {
			for (let j = i + 1; j < str.length + 1; j++) {
				substrings.push(str.slice(i, j).toLocaleLowerCase());
			}
		}
	}
	return substrings;
};

/**
 * check if current user data in db needs update (old data, admin introduces new sattelite data)
 */
const userNeedsUpdate = (user: { [key: string]: string }) => {
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
	if (user['photoURL'].includes('=s36') || user['photoURL'].includes('/s36')) {
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
			throw 'Email is null';
		}
	} catch (error) {
		throw new functions.https.HttpsError(
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

const createUserIfNotExist = functions.https.onCall(async (_data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError(
			'unauthenticated',
			'User is not authenticated'
		);
	}

	if (
		!context.auth.token.email ||
		!(
			context.auth.token.email.endsWith('@denison.edu') ||
			context.auth.token.email === 'deerx.test@gmail.com'
		) ||
		!context.auth.token.email_verified
	) {
		throw new functions.https.HttpsError(
			'permission-denied',
			'The user does not have permission'
		);
	}

	const updatedUser = updateUser(context.auth);

	const docSnap = await db.collection('users').doc(context.auth.uid).get();
	if (!docSnap.exists) {
		try {
			await db.collection('users').doc(context.auth.uid).set(updatedUser);
			return 'created';
		} catch (error) {
			logger.error('Fail to create user in database');
			logger.error(error);
			return 'error';
		}
	} else {
		const user = docSnap.data() as { [key: string]: string };
		if (userNeedsUpdate(user)) {
			try {
				await db.collection('users').doc(context.auth.uid).set(updatedUser);
				return 'updated';
			} catch (error) {
				logger.error('Fail to update user in database');
				logger.log(error);
				return 'error';
			}
		} else {
			return 'exist';
		}
	}
});
export default createUserIfNotExist;
