import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { UserRecord } from 'firebase-functions/v1/auth';
import {
	CORE_TEAM_EMAILS,
	DEFAULT_MESSAGE_NAME,
	DEFAULT_MESSAGE_THUMBNAIL,
	DEFAULT_SELF_MESSAGE_NAME,
	ERROR_MESSAGES,
} from '../constants';
import { db, svTime, Timestamp } from '../firebase.config';
import Logger from '../Logger';
import {
	ThreadName,
	ThreadPreviewData,
	ThreadThumbnail,
	UserInfo,
} from '../types';
import { isLoggedIn, isNotBanned } from '../utils';

const logger = new Logger();

const genThumbnail = (invoker: UserInfo, members: UserInfo[]) => {
	const thumbnail: ThreadThumbnail = {};
	if (members.length === 2) {
		if (members[0].uid === members[1].uid) {
			thumbnail[invoker.uid] = invoker.photoURL
				? invoker.photoURL
				: DEFAULT_MESSAGE_THUMBNAIL;
		} else {
			const otherMember = members.filter(
				(member) => member.uid !== invoker.uid
			)[0];
			thumbnail[invoker.uid] = otherMember.photoURL
				? otherMember.photoURL
				: DEFAULT_MESSAGE_THUMBNAIL;
			thumbnail[otherMember.uid] = invoker.photoURL
				? invoker.photoURL
				: DEFAULT_MESSAGE_THUMBNAIL;
		}
	} else {
		members.forEach(
			(member) =>
				(thumbnail[member.uid] = member.photoURL
					? member.photoURL
					: DEFAULT_MESSAGE_THUMBNAIL)
		);
	}
	return thumbnail;
};

const genName = (invoker: UserInfo, members: UserInfo[]) => {
	const name: ThreadName = {};
	// NOTE: it is implicit that members.length === 2. Cuz we not doing group messaging yet.
	if (members.length == 2) {
		if (members[0].uid === members[1].uid) {
			name[invoker.uid] = invoker.displayName
				? invoker.displayName
				: 'Message to self';
		} else {
			const otherMember = members.filter(
				(member) => member.uid !== invoker.uid
			)[0];
			name[invoker.uid] = otherMember.displayName
				? otherMember.displayName
				: DEFAULT_SELF_MESSAGE_NAME;
			name[otherMember.uid] = invoker.displayName
				? invoker.displayName
				: DEFAULT_MESSAGE_NAME;
		}
	} else {
		members.forEach((member) => {
			name[member.uid] = DEFAULT_MESSAGE_NAME;
		});
		logger.error('A thread somehow has gotten more than 2 members');
	}
	return name;
};

const genThreadId = (memberUids: string[]) => {
	return memberUids.sort().reduce((a, b) => `${a}${b}`);
};

const messageCoreTeam = functions.https.onCall(
	async (_data, context: functions.https.CallableContext) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);

		let coreTeamRecords: UserRecord[];
		try {
			coreTeamRecords = (
				await Promise.all(
					CORE_TEAM_EMAILS.map(async (email) => {
						try {
							return await admin.auth().getUserByEmail(email);
						} catch (error) {
							logger.error(`Fail to fetch user record by email: ${email}`);
							return null;
						}
					})
				)
			).filter((x) => x !== null) as UserRecord[];
		} catch (error) {
			logger.error(error);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failMsgCore
			);
		}

		const coreTeamInfos: UserInfo[] = coreTeamRecords
			.map((userRecord) => {
				if (
					'uid' in userRecord &&
					'email' in userRecord &&
					'displayName' in userRecord &&
					'photoURL' in userRecord
				) {
					return {
						uid: userRecord.uid,
						email: userRecord.email,
						displayName: userRecord.displayName,
						photoURL: userRecord.photoURL,
						disabled: false,
					};
				} else {
					return null;
				}
			})
			.filter((x) => x !== null) as UserInfo[];

		// init threadPreviewData, make sure logic matches frontend
		coreTeamInfos.forEach(async (coreTeamInfo) => {
			const members = [invoker, coreTeamInfo];
			const membersUid = [invoker.uid, coreTeamInfo.uid];
			const thumbnail = genThumbnail(invoker, members);
			const name = genName(invoker, members);

			const threadId = genThreadId(membersUid);
			const threadPreviewData: ThreadPreviewData = {
				id: threadId,
				members,
				membersUid,
				name,
				thumbnail,
				latestMessage: 'Send Your First Message',
				latestTime: svTime() as Timestamp,
				latestSeenAt: {},
				latestSenderUid: null,
			};
			try {
				await db
					.collection('threads')
					.doc(threadPreviewData.id)
					.set(threadPreviewData);
				logger.log(
					`Created new thread for guest (${invokerUid}): ${threadPreviewData.id}`
				);
			} catch (error) {
				logger.error(error);
				logger.error(
					`Fail to create new thread for guest (${invokerUid}): ${threadPreviewData.id}`
				);
			}
		});
		return 'ok';
	}
);

export default messageCoreTeam;
