import { CreateReportResponse } from '../../models/response/report/create-report-response';
import { CreateReportRequest } from '../../models/requests/report/create-report-request';
import { User } from '../../models/user/user';
import { CloudFunction } from '../../services/cloud-functions';
import { Firebase } from '../../services/firebase';
import { Utils } from '../../utils/utils';
import { ReportType, Report } from '../../models/report/report';
import { Listing } from '../../models/listing/listing';
import { Message } from '../../models/message/message';

export const createReport = CloudFunction.onCall(
	async (data: unknown, context) => {
		const invokerId = User.isLoggedIn(context);

		const invoker = await User.get(invokerId);

		User.isNotBanned(invoker);

		const requestData = CreateReportRequest.parse(data);

		if (requestData.type === ReportType.listing) {
			const evidenceData = await Listing.get(requestData.id);
			const newReportData = Report.parse({
				id: Utils.randomId(),
				type: requestData.type,
				detail: requestData.detail,
				evidence: evidenceData,
				reporter: invoker,
				reportedUid: evidenceData.seller.uid,
				createdAt: Firebase.localTime(),
			});
			await Report.create(newReportData);
			return CreateReportResponse.ok;
		}

		if (requestData.type === ReportType.message) {
			// this is type safe and data safe, already checked by
			// CreateReportRequest
			const [threadId, messageId] = requestData.id.split('/');
			const evidenceData = await Message.get(threadId, messageId);
			const newReportData = Report.parse({
				id: Utils.randomId(),
				type: requestData.type,
				detail: requestData.detail,
				evidence: evidenceData,
				reporter: invoker,
				reportedUid: evidenceData.sender.uid,
				createdAt: Firebase.localTime(),
			});
			await Report.create(newReportData);
			return CreateReportResponse.ok;
		}

		return CreateReportResponse.error;
	}
);
