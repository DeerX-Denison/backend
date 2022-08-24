import * as admin from 'firebase-admin';
import { UserRecord } from 'firebase-functions/v1/auth';
import { CallableContext } from 'firebase-functions/v1/https';
import { v4 as randomId } from 'uuid';
import { Collection } from '../models/collection';
import { AuthError } from '../models/errors/auth-error';
import { InternalError } from '../models/errors/internal-error';
import { NotFoundError } from '../models/errors/not-found-error';
import { Json, JsonValue } from '../models/json';
import { Timestamp } from '../models/timestamp';
import { User } from '../models/user/user';
import { Firebase } from '../service/firebase-service';
import { Validator } from './validator';

export class Utils {
	/**
	 * sort input json object's keys
	 * @param input JSON object
	 * @returns input JSON object with keys sorted in order
	 */
	public static sortJsonKeys(input: Json): Json {
		function sortJsonRecursively(input: unknown): unknown {
			if (typeof input !== 'object' || input === null) return input;

			if (Array.isArray(input)) return input.map((x) => sortJsonRecursively(x));

			return Object.keys(input)
				.sort()
				.reduce(
					(o, k) => ({
						...o,
						[k]: sortJsonRecursively((input as Record<string, unknown>)[k]),
					}),
					{}
				);
		}
		return sortJsonRecursively(input) as Json;
	}

	/**
	 * generate random unique id string
	 * @returns random unique id string
	 */
	public static randomString(): string {
		return randomId();
	}

	/**
	 * turn unknown input to be string
	 * @param input unknown input to be stringify
	 * @returns stringified version of input
	 */
	public static stringify(input: unknown): string {
		switch (typeof input) {
			case 'number':
				return input.toString();
			case 'string':
				return input;
			case 'object':
				return JSON.stringify(input);
			case 'undefined':
				return 'undefined';
			case 'boolean':
				if (input === true) return 'true';
				else return 'false';
			default:
				throw new Error(`Utils.stringify not implemented for ${typeof input}`);
		}
	}

	/**
	 * authenticate invoker's request
	 * @param context callable context created when function is called
	 * @returns id of invoker
	 */
	public static isLoggedIn(context: CallableContext): string {
		if (!context.auth) throw new AuthError();
		return context.auth.uid;
	}

	/**
	 * remove undefined properties from input json
	 * @param json input json to be removing properties
	 */
	public static removeUndefinedProperties(_json: Json): Json {
		const json = Validator.json('removeUndefinedProperties', _json);

		const recursivelyRemoveUndefinedProperties = (
			value: JsonValue
		): JsonValue => {
			if (typeof value !== 'object') return value;

			if (Array.isArray(value)) {
				return value.map((v) => recursivelyRemoveUndefinedProperties(v));
			}

			if (value === null) return null;

			return Object.fromEntries(
				Object.entries(value)
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					.filter(([_, v]) => v !== undefined)
					.map(([k, v]) => [k, recursivelyRemoveUndefinedProperties(v)])
			);
		};

		return recursivelyRemoveUndefinedProperties(json) as Json;
	}

	/**
	 * fetch an invoker from firestore
	 * @param uid uid of user to fetch
	 * @returns promise of an instance of a User model
	 */
	public static async fetchUser(uid: string): Promise<User> {
		let authUser: UserRecord;

		try {
			authUser = await Firebase.auth.getUser(uid);
		} catch (error) {
			throw new InternalError(error);
		}

		let dbUser: FirebaseFirestore.DocumentData;
		try {
			const docSnap = await Firebase.db
				.collection(Collection.users)
				.doc(uid)
				.get();

			if (!docSnap.exists) {
				throw new NotFoundError(new Error(`User not exist: ${uid}`));
			}

			const docData = docSnap.data();

			if (docData === undefined) {
				throw new NotFoundError(new Error(`User not exist: ${uid}`));
			}

			dbUser = docData;
		} catch (error) {
			throw new InternalError(error);
		}

		return new User('fetchUser', { ...dbUser, ...authUser });
	}

	/**
	 * set server time field value
	 */
	public static serverTime(): Timestamp {
		return admin.firestore.FieldValue.serverTimestamp() as Timestamp;
	}

	/**
	 * set local time field value
	 */
	public static localTime(): Timestamp {
		const now = Timestamp.now();
		return new Timestamp('localTime', {
			seconds: now.seconds,
			nanoseconds: now.nanoseconds,
		});
	}
}
