import { FirebaseError } from '@firebase/util';
import { DEFAULT_GUEST_DISPLAY_NAME, DEFAULT_GUEST_EMAIL } from '../constants';
import { CallableContext } from 'firebase-functions/v1/https';
import { ZodError } from 'zod';
import { Collection } from '../models/collection-name';
import { AuthError } from '../models/error/auth-error';
import { InternalError } from '../models/error/internal-error';
import { NotFoundError } from '../models/error/not-found-error';
import { ValidationError } from '../models/error/validation-error';
import { User } from '../models/user';
import { Firebase } from '../services/firebase-service';

export class Utils {
	/**
	 * general error handler wrapped around all cloud functions
	 */
	public static errorHandler(error: unknown) {
		console.error(error);
		if (error instanceof ZodError) {
			throw new ValidationError(error);
		} else if (error instanceof FirebaseError) {
			throw new InternalError(error);
		} else if (error instanceof AuthError) {
			throw error;
		} else {
			throw new InternalError(error);
		}
	}

	/**
	 * authorize invoker to be logged in
	 */
	public static isLoggedIn(context: CallableContext): string {
		if (!context.auth) throw new AuthError();
		return context.auth.uid;
	}

	/**
	 * fetch latest user all infomation
	 */
	public static async fetchUser(uid: string): Promise<User> {
		// fetch user record from firebase auth
		const authUser = await Firebase.auth.getUser(uid);

		// fetch user record from firestore
		const firestoreUser = (
			await Firebase.db.collection(Collection.users).doc(uid).get()
		).data();

		if (!firestoreUser) {
			throw new NotFoundError(new Error(`User not exist: ${uid}`));
		}

		return User.parse({ ...authUser, ...firestoreUser });
	}

	/**
	 * validate user is not banned
	 */
	public static isNotBanned(invoker: User): void {
		if (invoker.disabled) throw new AuthError();
	}

	/**
	 * validate user is guest
	 */
	public static isGuest(invoker: User): boolean {
		return (
			invoker.displayName === DEFAULT_GUEST_DISPLAY_NAME &&
			invoker.email === DEFAULT_GUEST_EMAIL
		);
	}
}
