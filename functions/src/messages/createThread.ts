import * as functions from 'firebase-functions';
import { ThreadPreviewData } from 'types';
import { db, svTime, Timestamp } from '../firebase.config';
import { fetchUser } from '../utils';

const createThread = functions.https.onCall(
	async (threadPreviewData: ThreadPreviewData, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User unauthenticated'
			);
		}

		const members = await Promise.all(
			threadPreviewData.membersUid.map(async (uid) => await fetchUser(uid))
		);

		const newThreadPreviewData: ThreadPreviewData = {
			...threadPreviewData,
			members,
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
