import * as functions from 'firebase-functions';
import { DEFAULT_MESSAGE_NAME, DEFAULT_USER_PHOTO_URL } from '../constants';
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
			throw new functions.https.HttpsError(
				'invalid-argument',
				'membersUid does not have length 2'
			);
		}

		if (!threadPreviewData.membersUid.includes(invoker.uid)) {
			throw new functions.https.HttpsError(
				'permission-denied',
				"Invoker is not thread's member"
			);
		}

		if (!threadPreviewData.id.includes(invoker.uid)) {
			throw new functions.https.HttpsError(
				'permission-denied',
				"Invoker is not thread's member (id)"
			);
		}

		const threadCreator = threadPreviewData.members.find(
			(x) => x.uid === context.auth?.uid
		);
		if (!threadCreator) {
			throw new functions.https.HttpsError(
				'permission-denied',
				"Invoker is not thread's member (thread creator)"
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
				throw new functions.https.HttpsError(
					'invalid-argument',
					'other members length is < 0'
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
			throw new functions.https.HttpsError(
				'internal',
				'Fail to create new thread',
				error
			);
		}
		return 'ok';
	}
);

export default createThread;
