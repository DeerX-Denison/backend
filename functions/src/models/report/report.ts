import { z } from 'zod';
import { NonEmptyString } from '../non-empty-string';
import { UserProfileSchema } from '../user/user-profile';
import { TimestampSchema } from '../timestamp';
import { ListingSchema } from '../listing/listing';
import { MessageSchema } from '../message/message';
import { ModelOptions } from '../model-options';
import { Firebase } from '../../services/firebase';
import { Collection } from '../collection-name';
import { Utils } from '../../utils/utils';

export enum ReportType {
	'listing' = 'listing',
	'message' = 'message',
}

export const ReportSchema = z.object({
	id: NonEmptyString,
	type: z.nativeEnum(ReportType),
	detail: NonEmptyString,
	evidence: ListingSchema.or(MessageSchema),
	reporter: UserProfileSchema,
	reportedUid: NonEmptyString,
	createdAt: TimestampSchema,
});

export type ReportData = z.infer<typeof ReportSchema>;

export class Report {
	public static parse(data: unknown) {
		return ReportSchema.parse(data);
	}

	/**
	 * create a report
	 * @param data report data to create
	 * @param opts create options
	 */
	public static async create(
		data: ReportData,
		opts: ModelOptions = {}
	): Promise<void> {
		const newReport = {
			...data,
			id: Utils.randomId(),
			createdAt: Firebase.serverTime(),
		};
		const reportRef = Firebase.db
			.collection(Collection.reports)
			.doc(newReport.id);
		if (opts.batch) {
			opts.batch.set(reportRef, newReport);
			return;
		}
		if (opts.transaction) {
			opts.transaction.set(reportRef, newReport);
			return;
		}
		await reportRef.set(newReport);
		return;
	}
}
