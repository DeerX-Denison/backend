import { ERROR_MESSAGES } from '../constants';
import Logger from '../Logger';
import { isLoggedIn, isNotBanned } from '../utils';
import { Firebase } from '../services/firebase';

const logger = new Logger();
const main = async ({ uid }: { uid: string }) => {
	try {
		await Firebase.auth.deleteUser(uid);
		logger.log(`Deleted user from auth: ${uid}`);
	} catch (error) {
		logger.error(error);
		logger.error(`Fail to delete anonymous user from auth: ${uid}`);
		throw new Firebase.functions.https.HttpsError(
			'internal',
			ERROR_MESSAGES.failDeleteAnonUser
		);
	}

	try {
		await Firebase.db.recursiveDelete(Firebase.db.collection('users').doc(uid));
		logger.log(`Recursively deleted member id ${uid}`);
	} catch (error) {
		logger.error(error);
		logger.error(`Fail to recursively delete anonymous user from db: ${uid}`);
		throw new Firebase.functions.https.HttpsError(
			'internal',
			ERROR_MESSAGES.failDeleteAnonUser
		);
	}

	let threadIds: string[];
	try {
		const querySnap = await Firebase.db
			.collection('threads')
			.where('membersUid', 'array-contains', uid)
			.get();
		threadIds = querySnap.docs.map((x) => x.id);
	} catch (error) {
		logger.error(error);
		logger.error(`Fail to query threads from db: ${uid}`);
		throw new Firebase.functions.https.HttpsError(
			'internal',
			ERROR_MESSAGES.failDeleteAnonUser
		);
	}

	threadIds.forEach(async (threadId) => {
		try {
			await Firebase.db.recursiveDelete(
				Firebase.db.collection('threads').doc(threadId)
			);
			logger.log(`Recursively deleted thread ids ${threadId}`);
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to recursively delete thread from db: ${threadId}`);
		}
	});

	let listingIds: string[];
	try {
		const querySnap = await Firebase.db
			.collection('guest_listings')
			.where('seller.uid', '==', uid)
			.get();
		listingIds = querySnap.docs.map((x) => x.id);
	} catch (error) {
		logger.error(error);
		logger.error(`Fail to query guest listings from db: ${uid}`);
		throw new Firebase.functions.https.HttpsError(
			'internal',
			ERROR_MESSAGES.failDeleteAnonUser
		);
	}

	const listingBatch = Firebase.db.batch();
	listingIds.forEach((id) =>
		listingBatch.delete(Firebase.db.collection('guest_listings').doc(id))
	);

	try {
		await listingBatch.commit();
		logger.log(`Deleted listing ids: [${listingIds.join(', ')}]`);
	} catch (error) {
		logger.error(error);
		logger.error(`Fail to delete queried listings from db: ${uid}`);
		throw new Firebase.functions.https.HttpsError(
			'internal',
			ERROR_MESSAGES.failDeleteAnonUser
		);
	}
};

const deleteAnonymousUser = Firebase.functions.https.onCall(
	async (_data, context) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);
		await main({ uid: invoker.uid });
	}
);

export default deleteAnonymousUser;
export { main };
