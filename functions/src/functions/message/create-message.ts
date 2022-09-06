import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { db } from '../../firebase.config';
import { Room } from '../../models/room';
import { Url } from '../../models/url';
import { Message } from '../../models/message';
import { CreateMessageRequest } from '../../models/requests/create-message-request';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { Utils } from '../../utils/utils';
import { NonEmptyString } from '../../models/non-empty-string';
import { DEFAULT_USER_PHOTO_URL, DEFAULT_MESSAGE_NAME } from '../../constants';
import { InternalError } from '../../models/error/internal-error';
import { ERROR_MESSAGES } from '../../constants';

export const createMessage = functions.https.onCall(
	async (data: unknown, context) => {
		try {
			// validate request data
			const requestData = CreateMessageRequest.parse(data);

			// authorize user
			const invokerId = Utils.isLoggedIn(context);

			const invoker = await Utils.fetchUser(invokerId);

			Utils.isNotBanned(invoker);

			Utils.isMember(requestData.threadPreviewData.membersUid, invokerId);

			Utils.isMember(requestData.message.membersUid, invokerId);

			// create new message
			const members = [
				...(await Promise.all(
					requestData.threadPreviewData.membersUid
						.filter((x) => x !== invokerId)
						.map(Utils.fetchUser)
				)),
				invoker,
			];

			const newMessage = Message.parse({
				...requestData.message,
				sender: invoker,
				time: admin.firestore.Timestamp.now(),
				seenAt: {
					...requestData.message.seenAt,
					[requestData.message.sender.uid]: admin.firestore.Timestamp.now(),
				},
			});

			// create new message in db
			const batch = db.batch();

			batch.set(
				db
					.collection('threads')
					.doc(requestData.threadPreviewData.id)
					.collection('messages')
					.doc(requestData.message.id),
				{
					...newMessage,
					time: admin.firestore.FieldValue.serverTimestamp(),
					seenAt: {
						...newMessage.seenAt,
						[requestData.message.sender.uid]:
							admin.firestore.FieldValue.serverTimestamp(),
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
						: DEFAULT_MESSAGE_NAME;
					thumbnail[member.uid] = otherMember.photoURL
						? otherMember.photoURL
						: DEFAULT_USER_PHOTO_URL;
				} else if (otherMembers.length === 0) {
					const self = members.filter((x) => x.uid === context.auth?.uid)[0];
					name[self.uid] = self.displayName
						? self.displayName
						: DEFAULT_MESSAGE_NAME;
					thumbnail[self.uid] = self.photoURL
						? self.photoURL
						: DEFAULT_USER_PHOTO_URL;
				} else {
					throw new InternalError(ERROR_MESSAGES.invalidInput);
				}
			});

			const updatedRoom = Room.parse({
				...requestData.threadPreviewData,
				thumbnail,
				name,
				members,
				latestMessage: newMessage.content,
				latestTime: newMessage.time,
				latestSenderUid: newMessage.sender.uid,
				latestSeenAt: newMessage.seenAt,
			});

			batch.update(
				db.collection('threads').doc(requestData.threadPreviewData.id),
				{
					...updatedRoom,
					latestTime: admin.firestore.FieldValue.serverTimestamp(),
					latestSeenAt: {
						...newMessage.seenAt,
						[requestData.message.sender.uid]:
							admin.firestore.FieldValue.serverTimestamp(),
					},
				}
			);

			try {
				await batch.commit();
			} catch (error) {
				throw new InternalError(error);
			}

			// parse response
			return ConfirmationResponse.parse();
		} catch (error) {
			return Utils.errorHandler(error);
		}
	}
);
