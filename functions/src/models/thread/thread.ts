import { z } from 'zod';
import { NonEmptyString } from '../non-empty-string';
import { Url } from '../url';
import { UserProfileSchema } from '../user/user-profile';
import { User, UserData } from '../user/user';
import { TimestampSchema } from '../timestamp';
import { Firebase } from '../../services/firebase';
import { Collection } from '../collection-name';
import { NotFoundError } from '../error/not-found-error';
import { ModelOptions } from '../model-options';
import { Config } from '../../config';

export const ThreadSchema = z.object({
	id: NonEmptyString,
	members: z.array(UserProfileSchema),
	membersUid: z.array(NonEmptyString).min(2),
	thumbnail: z.record(NonEmptyString, Url),
	name: z.record(NonEmptyString, NonEmptyString),
	latestMessage: NonEmptyString,
	latestTime: TimestampSchema,
	latestSenderUid: NonEmptyString,
	latestSeenAt: z.record(NonEmptyString, z.union([TimestampSchema, z.null()])),
});

export type ThreadData = z.infer<typeof ThreadSchema>;

export class Thread {
	public static parse(data: unknown) {
		return ThreadSchema.parse(data);
	}

	/**
	 * get a thread from database
	 * @param id id of thread to get from database
	 */
	public static async get(id: string): Promise<ThreadData> {
		const documentSnapshot = await Firebase.db
			.collection(Collection.threads)
			.doc(id)
			.get();

		if (!documentSnapshot.exists || documentSnapshot.data() === undefined) {
			throw new NotFoundError(new Error('Thread not exist'));
		}
		console.log(documentSnapshot.data());

		return this.parse(documentSnapshot.data());
	}

	/**
	 * create a new thread from input thread data
	 * @param thread input thread data to create
	 */
	public static async create(
		threadId: string,
		membersUid: string[],
		invoker: UserData
	): Promise<void> {
		const members = await Promise.all(
			membersUid.filter((x) => x !== invoker.uid).map((uid) => User.get(uid))
		);
		members.push(invoker);

		const name: Record<NonEmptyString, NonEmptyString> = {};
		const thumbnail: Record<NonEmptyString, Url> = {};
		members.forEach((member) => {
			const otherMembers = members.filter((x) => x.uid !== member.uid);
			if (otherMembers.length > 0) {
				const otherMember = otherMembers[0];
				name[member.uid] = otherMember.displayName
					? otherMember.displayName
					: Config.defaultMessageName;
				thumbnail[member.uid] = otherMember.photoURL
					? otherMember.photoURL
					: Config.defaultUserPhotoURL;
			} else if (otherMembers.length === 0) {
				name[invoker.uid] = invoker.displayName
					? invoker.displayName
					: Config.defaultMessageName;
				thumbnail[invoker.uid] = invoker.photoURL
					? invoker.photoURL
					: Config.defaultUserPhotoURL;
			}
		});

		const newThread = this.parse({
			id: threadId,
			membersUid,
			thumbnail,
			name,
			members,
			latestMessage: Config.newRoomMessage,
			latestTime: Firebase.localTime(),
			latestSenderUid: invoker.uid,
			latestSeenAt: {},
		});

		await Firebase.db
			.collection('threads')
			.doc(threadId)
			.set({ ...newThread, latestTime: Firebase.serverTime() });
	}

	/**
	 * update thread with input id and thread data
	 * @param id id of thread to update
	 * @param thread thread data to update
	 */
	public static async update(
		id: string,
		thread: Partial<ThreadData>,
		opts: ModelOptions = {}
	) {
		if (opts.batch) {
			opts.batch.update(
				Firebase.db.collection(Collection.threads).doc(id),
				thread
			);
		} else {
			await Firebase.db.collection(Collection.threads).doc(id).update(thread);
		}
	}
}
