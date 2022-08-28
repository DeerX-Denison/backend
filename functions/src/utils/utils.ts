import { FirebaseError } from '@firebase/util';
import { CallableContext } from 'firebase-functions/v1/https';
import { Listing } from '../models/listing';
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
		} else if (error instanceof NotFoundError) {
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
	 * validate invoker and targetUid matches
	 */
	public static isSelf(invokerUid: string, targetUid: string): void {
		if (invokerUid !== targetUid) throw new AuthError();
	}

	/**
	 * fetch latest listing data from provided id
	 */
	public static async fetchListing(listingId: string): Promise<Listing> {
		const docSnap = await Firebase.db
			.collection(Collection.listings)
			.doc(listingId)
			.get();
		if (!docSnap.data())
			throw new NotFoundError(`undefined listingId: ${listingId}`);

		return Listing.parse(docSnap.data());
	}
}
