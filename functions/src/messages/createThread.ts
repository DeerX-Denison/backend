import * as functions from 'firebase-functions';
import {
	DEFAULT_MESSAGE_NAME,
	DEFAULT_USER_PHOTO_URL,
	ERROR_MESSAGES,
} from '../constants';
import { db, svTime, Timestamp } from '../firebase.config';
import Logger from '../Logger';
import { ThreadName, ThreadPreviewData, ThreadThumbnail } from '../types';
import { fetchUserInfo, isLoggedIn, isNotBanned } from '../utils';
const logger = new Logger();

const createThread = functions.https.onCall(
	async (threadPreviewData: ThreadPreviewData, context) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);

		if (threadPreviewData.membersUid.length !== 2) {
			logger.error(
				`membersUid does not have length 2: ${threadPreviewData.id}`
			);
			throw new functions.https.HttpsError(
				'invalid-argument',
				ERROR_MESSAGES.invalidInput
			);
		}

		if (!threadPreviewData.membersUid.includes(invoker.uid)) {
			logger.log(
				`Invoker (${invoker.uid}) is not thread's member: ${threadPreviewData.id}`
			);
			throw new functions.https.HttpsError(
				'permission-denied',
				ERROR_MESSAGES.notThreadMember
			);
		}

		if (!threadPreviewData.id.includes(invoker.uid)) {
			logger.log(
				`Invoker (${invoker.uid}) is not thread's member (id): ${threadPreviewData.id}`
			);
			throw new functions.https.HttpsError(
				'permission-denied',
				ERROR_MESSAGES.notThreadMember
			);
		}

		const threadCreator = threadPreviewData.members.find(
			(x) => x.uid === context.auth?.uid
		);
		if (!threadCreator) {
			throw new functions.https.HttpsError(
				'permission-denied',
				`Invoker (${invoker.uid}) is not thread's member (thread creator): ${threadPreviewData.id}`
			);
		}

		// fetch updated members from membersUid
		const members = await Promise.all(
			threadPreviewData.membersUid.map(async (uid) => {
				if (uid === invoker.uid) return invoker;
				return await fetchUserInfo(uid);
			})
		);

		// parse updated name and thumbnail from updated members info
		const name: ThreadName = {};
		const thumbnail: ThreadThumbnail = {};

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
				logger.error(`other members length is < 0: ${threadPreviewData.id}`);
				throw new functions.https.HttpsError(
					'invalid-argument',
					ERROR_MESSAGES.invalidInput
				);
			}
		});

		// update new thread preview data to db
		const newThreadPreviewData: ThreadPreviewData = {
			...threadPreviewData,
			members,
			name,
			thumbnail,
			latestTime: svTime() as Timestamp,
		};

		try {
			await db
				.collection('threads')
				.doc(threadPreviewData.id)
				.set(newThreadPreviewData);
			logger.log(`Created new thread: ${threadPreviewData.id}`);
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to create new thread: ${threadPreviewData.id}`);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failCreateThread
			);
		}
		return 'ok';
	}
);

export default createThread;
