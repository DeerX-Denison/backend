import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { UserRecord } from 'firebase-functions/v1/auth';
import { CORE_TEAM_EMAILS, ERROR_MESSAGES } from '../constants';
import Logger from '../Logger';
import { UserInfo } from '../types';
import { isLoggedIn, isNotBanned } from '../utils';

const logger = new Logger();

const fetchCoreTeamInfos = functions.https.onCall(
	async (_data, context: functions.https.CallableContext) => {
		const invokerUid = isLoggedIn(context);
		await isNotBanned(invokerUid);

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
		return coreTeamInfos;
	}
);

export default fetchCoreTeamInfos;
