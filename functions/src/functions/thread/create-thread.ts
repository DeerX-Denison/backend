import { Room } from '../../models/room';
import { Url } from '../../models/url';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { Utils } from '../../utils/utils';
import { NonEmptyString } from '../../models/non-empty-string';
import {
	DEFAULT_USER_PHOTO_URL,
	DEFAULT_MESSAGE_NAME,
	NEW_ROOM_MESSAGE,
} from '../../constants';
import { InternalError } from '../../models/error/internal-error';
import { ERROR_MESSAGES } from '../../constants';
import { CreateRoomRequest } from '../../models/requests/create-room-request';
import { Firebase } from '../../services/firebase';

export const createThread = Firebase.functions.https.onCall(
	async (data: unknown, context) => {
		try {
			// validate request data
			const requestData = CreateRoomRequest.parse(data);

			// authorize user
			const invokerId = Utils.isLoggedIn(context);

			const invoker = await Utils.fetchUser(invokerId);

			Utils.isNotBanned(invoker);

			Utils.isMember(requestData.membersUid, invokerId);

			// fetch members if room
			const members = [
				...(await Promise.all(
					requestData.membersUid
						.filter((x) => x !== invokerId)
						.map(Utils.fetchUser)
				)),
				invoker,
			];

			// parse updated name and thumbnail from members info
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

			// generate new room
			const newRoom = Room.parse({
				...requestData,
				thumbnail,
				name,
				members,
				latestMessage: NEW_ROOM_MESSAGE,
				latestTime: Firebase.localTime(),
				latestSenderUid: invokerId,
				latestSeenAt: {},
			});

			// update db with new room
			try {
				await Firebase.db.collection('threads').doc(newRoom.id).set(newRoom);
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
