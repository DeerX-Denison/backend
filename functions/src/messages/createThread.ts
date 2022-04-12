import * as functions from 'firebase-functions';
import { DEFAULT_MESSAGE_NAME, DEFAULT_USER_PHOTO_URL } from '../constants';
import { db, svTime, Timestamp } from '../firebase.config';
import { ThreadName, ThreadPreviewData, ThreadThumbnail } from '../types';
import { fetchUserInfo } from '../utils';

const createThread = functions.https.onCall(
	async (threadPreviewData: ThreadPreviewData, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}

		if (threadPreviewData.membersUid.length !== 2) {
			throw new functions.https.HttpsError(
				'invalid-argument',
				'membersUid does not have length 2'
			);
		}

		// fetch updated members from membersUid
		const members = await Promise.all(
			threadPreviewData.membersUid.map(async (uid) => await fetchUserInfo(uid))
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
