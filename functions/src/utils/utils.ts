import { FirebaseError, uuidv4 } from '@firebase/util';
import os from 'os';
import { CallableContext } from 'firebase-functions/v1/https';
import { Listing } from '../models/listing/listing';
import { ZodError } from 'zod';
import { Collection } from '../models/collection-name';
import { AuthError } from '../models/error/auth-error';
import { InternalError } from '../models/error/internal-error';
import { NotFoundError } from '../models/error/not-found-error';
import { ValidationError } from '../models/error/validation-error';
import { User } from '../models/user/user';
import { Firebase } from '../services/firebase';
import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { Config } from '../config';
import { Logger } from '../services/logger';
import { Message } from '../models/message/message';
import path from 'path';

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
	 * fetch message from given thread id and message id
	 * @param threadId id of thread to fetch from
	 * @param messageId id of message to fetch
	 * @returns instance of Message
	 */
	public static async fetchMessage(
		threadId: string,
		messageId: string
	): Promise<Message> {
		const docSnap = await Firebase.db
			.collection(Collection.threads)
			.doc(threadId)
			.collection(Collection.messages)
			.doc(messageId)
			.get();
		if (docSnap.exists || docSnap.data() === undefined) {
			throw new NotFoundError(
				new Error(`Message does not exist: ${threadId}/${messageId}`)
			);
		}
		return Message.parse(docSnap.data());
	}

	/**
	 * validate invokerUid matches targetUid
	 */
	public static isSelf(invokerUid: string, targetUid: string) {
		if (invokerUid !== targetUid) throw new AuthError();
	}

	/**
	 * fetch latest listing from provided listingId
	 */
	public static async fetchListing(
		listingId: string,
		isGuest: boolean
	): Promise<Listing> {
		const docSnap = await Firebase.db
			.collection(isGuest ? Collection.guest_listings : Collection.listings)
			.doc(listingId)
			.get();

		if (!docSnap.data())
			throw new NotFoundError(`Listing not found: ${listingId}`);

		return Listing.parse(docSnap.data());
	}

	/**
	 * delete image base on provided imageRef from storage
	 */
	public static async deleteImage(imageRef: string): Promise<void> {
		const fileRef = Firebase.storage.file(imageRef);
		const [exists] = await fileRef.exists();
		if (exists) {
			await Firebase.storage.file(imageRef).delete();
		}
	}

	/**
	 * validate valid email address
	 */
	public static validEmail(authData: AuthData | undefined) {
		if (!authData) throw new AuthError();
		const email = authData.token.email;
		if (!email) throw new AuthError();
		if (!authData.token.email_verified) throw new AuthError();
		if (email.endsWith(Config.emailPrefix)) return email;
		if (Config.testerEmails.includes(email)) return email;
		console.log(Config.testerEmails);
		throw new AuthError();
	}

	/**
	 * validate invoker to not be anonymous user
	 */
	public static isAnonymousUser(context: CallableContext) {
		return context.auth?.token?.firebase?.sign_in_provider === 'anonymous';
	}

	/**
	 * generate array of all substrings of input string
	 */
	public static getAllSubstrings(s: string): string[] {
		const substrings: string[] = [];
		if (s) {
			for (let i = 0; i < s.length; i++) {
				for (let j = i + 1; j < s.length + 1; j++) {
					substrings.push(s.slice(i, j).toLocaleLowerCase());
				}
			}
		}
		return substrings;
	}

	/**
	 * validate an invoker uid is part of membersUid
	 */
	public static isMember(membersUid: string[], invokerUid: string) {
		return membersUid.includes(invokerUid);
	}

	/**
	 * Check if unknown input value is dictionary
	 * @param o input unknown value to be checked
	 * @returns boolean if input is a dictionary
	 */
	public static isDictionary(o: unknown): o is Record<string, unknown> {
		return typeof o === 'object' && o !== null && !Array.isArray(o);
	}

	/**
	 * check 2 diciontary to be identical. Identical means
	 * similar key disregarding order, and similar values.
	 * Only checks raw data of dictionary, will not check
	 * for methods of classes.
	 * @param d1 dictionary 1 to check
	 * @param d2 dictionary 2 to check
	 * @returns boolean
	 */
	public static identicalDictionary(d1: unknown, d2: unknown): boolean {
		return (
			this.isDictionary(d1) &&
			this.isDictionary(d2) &&
			Object.entries(d1).sort().toString() ===
				Object.entries(d2).sort().toString()
		);
	}

	/**
	 * handle error thrown in cloud functions
	 * @param error error throw while executing functions
	 */
	public static cloudFunctionHandler(error: unknown) {
		Logger.error(error);
		if (error instanceof ZodError) return new ValidationError(error);
		return error;
	}

	/**
	 * randomly generate a string
	 * @returns random string id
	 */
	public static randomId(): string {
		return uuidv4();
	}

	/**
	 * generate a temp path for file with input file name
	 * @param fileName name of file at temp path
	 * @returns temp path to file with input file name
	 */
	public static tempPath(fileName: string): string {
		return path.join(os.tmpdir(), fileName);
	}
}
