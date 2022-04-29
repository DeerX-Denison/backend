import * as functions from 'firebase-functions';
import { ReportData } from 'types';
import Logger from '../Logger';
import { isLoggedIn, isNotBanned } from '../utils';

const logger = new Logger();

const createReport = functions.https.onCall(
	async (data: ReportData, context: functions.https.CallableContext) => {
		const invokerUid = isLoggedIn(context);
		const invoker = await isNotBanned(invokerUid);
		logger.log(data);
		console.log(invoker);

		return 'ok';
	}
);

export default createReport;
