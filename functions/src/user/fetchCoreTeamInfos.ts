import { UserRecord } from 'firebase-functions/v1/auth';
import { CORE_TEAM_EMAILS, ERROR_MESSAGES } from '../constants';
import Logger from '../Logger';
import { UserInfo } from '../types';
import { isLoggedIn, isNotBanned } from '../utils';
import { Firebase } from '../services/firebase';

const logger = new Logger();

/**
 * Deprecated. The app is no longer supporting anonymous sign in.
 * It will be removed in future updates.
 */
const fetchCoreTeamInfos = Firebase.functions.https.onCall(
	async (_data, context) => {
		const invokerUid = isLoggedIn(context);
		await isNotBanned(invokerUid);

		let coreTeamRecords: UserRecord[];
		try {
			coreTeamRecords = (
				await Promise.all(
					CORE_TEAM_EMAILS.map(async (email) => {
						try {
							return await Firebase.auth.getUserByEmail(email);
						} catch (error) {
							logger.error(`Fail to fetch user record by email: ${email}`);
							return null;
						}
					})
				)
			).filter((x) => x !== null) as UserRecord[];
		} catch (error) {
			logger.error(error);
			throw new Firebase.functions.https.HttpsError(
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
		return coreTeamInfos;
	}
);

export default fetchCoreTeamInfos;
