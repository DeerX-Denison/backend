import { z } from 'zod';
import { ReportType } from '../../report/report';
import { NonEmptyString } from '../../non-empty-string';

export const CreateReportRequest = z
	.object({
		id: NonEmptyString,
		type: z.nativeEnum(ReportType),
		detail: NonEmptyString,
	})
	.refine((obj) => {
		if (obj.type === ReportType.message) {
			return obj.id.split('/').length === 2;
		} else {
			return true;
		}
	});

export type CreateReportRequest = z.infer<typeof CreateReportRequest>;
