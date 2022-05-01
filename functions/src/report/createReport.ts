import * as functions from 'firebase-functions';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_MESSAGES } from '../constants';
import { db, svTime } from '../firebase.config';
import Logger from '../Logger';
import {
	CreateReportParameter,
	ListingData,
	MessageData,
	ReportData,
} from '../types';
import {
	fetchListingData,
	fetchMessage,
	isLoggedIn,
	isNotBanned,
} from '../utils';

const logger = new Logger();

const createReport = functions.https.onCall(
	async (
		data: CreateReportParameter,
		context: functions.https.CallableContext
	) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);
		let evidenceData: ListingData | MessageData;
		let reportedUid: string;
		if (data.type === 'listing') {
			const listingData = await fetchListingData(data.id);
			if (!listingData) {
				logger.error(`Fail to fetch listing data: ${data.id}`);
				throw new functions.https.HttpsError(
					'internal',
					ERROR_MESSAGES.failCreateReport
				);
			}
			logger.log(`Fetched listing data: ${data.id}`);
			evidenceData = listingData;
			reportedUid = listingData.seller.uid;
		} else if (data.type === 'message') {
			if (!data.id.includes('/')) {
				logger.log(`report data of type message does not have "/" in id`);
				throw new functions.https.HttpsError(
					'invalid-argument',
					ERROR_MESSAGES.invalidInput
				);
			}
			const [threadId, messageId] = data.id.split('/');
			const messageData = await fetchMessage(threadId, messageId);
			if (!messageData) {
				logger.error(`Fail to fetch message data: ${threadId}/${messageId}`);
				throw new functions.https.HttpsError(
					'internal',
					ERROR_MESSAGES.failCreateReport
				);
			}

			logger.log(`Fetched message data: ${threadId}/${messageId}`);
			evidenceData = messageData;
			reportedUid = messageData.sender.uid;
		} else {
			logger.error(
				`Invalid report data type (${invokerUid}): ${JSON.stringify(data)}`
			);
			throw new functions.https.HttpsError(
				'invalid-argument',
				ERROR_MESSAGES.invalidInput
			);
		}

		const newReportData: ReportData = {
			id: uuidv4(),
			type: data.type,
			detail: data.detail,
			evidence: evidenceData,
			reporter: invoker,
			reportedUid,
			createdAt: svTime() as FirebaseFirestore.Timestamp,
		};
		try {
			await db.collection('reports').doc(newReportData.id).set(newReportData);
		} catch (error) {
			logger.error(error);
			logger.error(`Fail to save new report to database: ${newReportData.id}`);
			throw new functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failCreateReport
			);
		}
		return 'ok';
	}
);

export default createReport;
