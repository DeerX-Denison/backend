import { Config } from '../config';
import { CallableContext, Firebase } from '../services/firebase';
import { Utils } from '../utils/utils';

export class CloudFunction {
	public static onCall = (
		callback: (data: unknown, context: CallableContext) => unknown
	) =>
		Firebase.functions
			.region(...Config.regions)
			.https.onCall(async (data, context) => {
				try {
					return await callback(data, context);
				} catch (error) {
					Utils.errorHandler(error);
				}
			});
}
