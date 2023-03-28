import { ModelOptions } from '../model-options';
import { NonEmptyString } from '../non-empty-string';
import { TimestampSchema } from '../timestamp';
import { z } from 'zod';
import { Firebase } from '../../services/firebase';
import { Collection } from '../collection-name';

export const FCMTokenSchema = z.object({
	deviceId: NonEmptyString,
	token: NonEmptyString,
	updatedAt: TimestampSchema,
});

export type FCMTokenData = z.infer<typeof FCMTokenSchema>;

export class FCMToken {
	public static parse(data: unknown) {
		return FCMTokenSchema.parse(data);
	}

	/**
	 * get fcm token from input uid with input device id
	 * @param uid id of user to get fcm token
	 * @param deviceId id of fcm token
	 * @param opts create options
	 */
	public static async get(
		uid: string,
		deviceId: string,
		opts: ModelOptions = {}
	): Promise<FCMTokenData> {
		uid;
		deviceId;
		opts;
		throw 'Not implemented';
	}

	/**
	 * create a fcm token for input uid with id of device id
	 * @param uid id of user to create fcm token
	 * @param deviceId id of fcm token
	 * @param opts create options
	 */
	public static async create(
		uid: string,
		deviceId: string,
		token: string,
		opts: ModelOptions = {}
	): Promise<string> {
		const documentReference = Firebase.db
			.collection(Collection.users)
			.doc(uid)
			.collection(Collection.fcm_tokens)
			.doc(deviceId);
		const newToken = {
			deviceId,
			token,
			updatedAt: Firebase.serverTime(),
		};
		if (opts.batch) {
			opts.batch.create(documentReference, newToken);
			return deviceId;
		}
		if (opts.transaction) {
			opts.transaction.create(documentReference, newToken);
			return deviceId;
		}
		await documentReference.set(newToken);
		return deviceId;
	}

	/**
	 * update a fcm token for input uid at token id of device id
	 * with value of input token
	 * @param uid id of user to create fcm token
	 * @param deviceId id of fcm token
	 * @param token updated token
	 * @param opts update options
	 */
	public static async update(
		uid: string,
		deviceId: string,
		token: string,
		opts: ModelOptions = {}
	): Promise<void> {
		const documentReference = Firebase.db
			.collection(Collection.users)
			.doc(uid)
			.collection(Collection.fcm_tokens)
			.doc(deviceId);
		const updatedToken = { token, updatedAt: Firebase.serverTime() };
		if (opts.batch) {
			opts.batch.update(documentReference, updatedToken);
			return;
		}
		if (opts.transaction) {
			opts.transaction.update(documentReference, updatedToken);
			return;
		}
		await documentReference.update(updatedToken);
		return;
	}

	/**
	 * delete a fcm token for input uid at token id of device id
	 * @param uid id of user to create fcm token
	 * @param deviceId id of fcm token
	 * @param opts delete options
	 */
	public static async delete(
		uid: string,
		deviceId: string,
		opts: ModelOptions = {}
	): Promise<void> {
		const documentReference = Firebase.db
			.collection(Collection.users)
			.doc(uid)
			.collection(Collection.fcm_tokens)
			.doc(deviceId);
		if (opts.batch) {
			opts.batch.delete(documentReference);
			return;
		}
		if (opts.transaction) {
			opts.transaction.delete(documentReference);
			return;
		}
		await documentReference.delete();
		return;
	}
}
