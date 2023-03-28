import { z } from 'zod';
import { NonEmptyString } from '../non-empty-string';
import { MessageRefSchema } from './message-ref';
import { MessageSeenAtSchema } from './message-seen-at';
import { UserProfileSchema } from '../user/user-profile';
import { MessageContentType } from './message-content-type';
import { User, UserData } from '../user/user';
import { TimestampSchema } from '../timestamp';
import { Firebase } from '../../services/firebase';
import { Collection } from '../collection-name';
import { NotFoundError } from '../error/not-found-error';
import { Config } from '../../config';
import { Thread, ThreadData } from '../thread/thread';
import { Url } from '../url';
import { ModelOptions } from '../model-options';

export const MessageSchema = z.object({
	id: NonEmptyString,
	sender: UserProfileSchema,
	time: TimestampSchema,
	contentType: z.array(z.nativeEnum(MessageContentType)).min(1),
	content: NonEmptyString,
	membersUid: z.array(NonEmptyString).min(2),
	threadName: z.record(NonEmptyString, NonEmptyString),
	seenAt: MessageSeenAtSchema,
	refs: z.array(MessageRefSchema),
});

export type MessageData = z.infer<typeof MessageSchema>;

export class Message {
	/**
	 * mark input list of messages as read by input reader id
	 * @param readerId id of message reader
	 * @param messages messages to mark as read
	 */
	public static async markManyAsRead(
		readerId: string,
		threadId: string,
		messages: MessageData[]
	): Promise<void> {
		const batch = Firebase.db.batch();
		await Promise.all(
			messages.map((message) =>
				this.update(
					threadId,
					{
						...message,
						seenAt: { ...message.seenAt, [readerId]: Firebase.localTime() },
					},
					{ batch }
				)
			)
		);
		// get latest message
		const latestMessage = messages.sort((a, b) =>
			a.time.valueOf() > b.time.valueOf() ? -1 : 1
		)[0];
		await Thread.update(
			threadId,
			{ latestSeenAt: latestMessage.seenAt },
			{ batch }
		);
		await batch.commit();
	}

	/**
	 * get a message from database
	 * @param threadId id of thread to fetch message from
	 * @param messageId id of message to thread message from
	 * @returns message data
	 */
	public static async get(
		threadId: string,
		messageId: string
	): Promise<MessageData> {
		const documentSnapshot = await Firebase.db
			.collection(Collection.threads)
			.doc(threadId)
			.collection(Collection.messages)
			.doc(messageId)
			.get();

		if (!documentSnapshot.exists || documentSnapshot.data() === undefined) {
			throw new NotFoundError(new Error('Message not found'));
		}

		return this.parse(documentSnapshot.data());
	}

	/**
	 * get many message from input message id
	 * @param threadId input thread id to get messages from
	 * @param messagesId list of input message id to get
	 * @returns list of message data base on in put id
	 */
	public static async getMany(
		threadId: string,
		messagesId: string[]
	): Promise<MessageData[]> {
		return await Promise.all(
			messagesId.map((messageId) => this.get(threadId, messageId))
		);
	}
	/**
	 * create a new message with input thread id and input message data
	 * @param thread input thread id to create new message in
	 * @param message input message data to create
	 */
	public static async create(
		thread: ThreadData,
		message: MessageData,
		invoker: UserData
	): Promise<void> {
		const members = await Promise.all(
			message.membersUid
				.filter((uid) => uid !== message.sender.uid)
				.map((uid) => User.get(uid))
		);

		members.push(invoker);

		const newMessage = Message.parse({
			...message,
			sender: invoker,
			time: Firebase.localTime(),
			seenAt: {
				...message.seenAt,
				[message.sender.uid]: Firebase.localTime(),
			},
		});

		const batch = Firebase.db.batch();

		batch.set(
			Firebase.db
				.collection('threads')
				.doc(thread.id)
				.collection('messages')
				.doc(message.id),
			{
				...newMessage,
				time: Firebase.serverTime(),
				seenAt: {
					...newMessage.seenAt,
					[message.sender.uid]: Firebase.serverTime(),
				},
			}
		);

		// update room data
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
					: Config.defaultSelfMessageName;
				thumbnail[invoker.uid] = invoker.photoURL
					? invoker.photoURL
					: Config.defaultUserPhotoURL;
			}
		});

		const updatedRoom = Thread.parse({
			...thread,
			thumbnail,
			name,
			members,
			latestMessage: newMessage.content,
			latestTime: newMessage.time,
			latestSenderUid: newMessage.sender.uid,
			latestSeenAt: newMessage.seenAt,
		});

		batch.update(Firebase.db.collection('threads').doc(thread.id), {
			...updatedRoom,
			latestTime: Firebase.serverTime(),
			latestSeenAt: {
				...newMessage.seenAt,
				[message.sender.uid]: Firebase.serverTime(),
			},
		});

		await batch.commit();
	}

	public static async update(
		threadId: string,
		message: MessageData,
		opts: ModelOptions = {}
	): Promise<void> {
		if (opts.batch) {
			opts.batch.update(
				Firebase.db
					.collection(Collection.threads)
					.doc(threadId)
					.collection(Collection.messages)
					.doc(message.id),
				message
			);
			return;
		}
		await Firebase.db
			.collection(Collection.threads)
			.doc(threadId)
			.collection(Collection.messages)
			.doc(message.id)
			.update(message);
		return;
	}

	public static parse(data: unknown) {
		return MessageSchema.parse(data);
	}
}
