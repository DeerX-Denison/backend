import { UserFCMTokenData } from 'types';
import Logger from '../Logger';
import { Firebase } from '../services/firebase';
import { MulticastMessage } from 'firebase-admin/messaging';

const logger = new Logger();

const sendManualMessage = Firebase.functions.https.onCall(
	async (data: { delay: number }, context) => {
		if (!context.auth) return 'unauthorized';
		const { delay } = data;
		const querySnap = await Firebase.db
			.collection('users')
			.doc(context.auth.uid)
			.collection('fcm_tokens')
			.get();
		const tokensData: UserFCMTokenData[] = querySnap.docs.map(
			(docSnap) => docSnap.data() as UserFCMTokenData
		);
		const tokens = tokensData.map((tokenData) => tokenData.token);

		const message: MulticastMessage = {
			data: {
				message: JSON.stringify({
					content: 'hello world',
					contentType: 'text',
					threadName: {
						[context.auth.uid]: 'Manual message',
					},
				}),
			},
			apns: {
				payload: {
					aps: {
						alert: {
							body: 'the body text',
							title: 'the title',
						},
						sound: ' default',
					},
				},
			},
			tokens,
		};
		if (delay === 0) {
			logger.log(`sending message with delay: ${delay}`);
			try {
				const { responses, successCount, failureCount } =
					await Firebase.msg.sendMulticast(message);
				logger.log(`successCount: ${successCount}`);
				logger.log(`failureCount: ${failureCount}`);
				logger.log(responses);
			} catch (error) {
				logger.error(`Can't send messaging to devices`);
				logger.error(error);
				return 'error';
			}
		} else {
			logger.log(`sending message with delay: ${delay}`);
			try {
				await new Promise<void>((res, rej) => {
					setTimeout(async () => {
						try {
							const { responses, successCount, failureCount } =
								await Firebase.msg.sendMulticast(message);
							logger.log(`successCount: ${successCount}`);
							logger.log(`failureCount: ${failureCount}`);
							logger.log(responses);
							res();
						} catch (error) {
							logger.error(`Can't send messaging to devices`);
							logger.error(error);
							rej();
						}
					}, delay);
				});
			} catch (error) {
				logger.error(`Can't send messaging to devices`);
				logger.error(error);
				return 'error';
			}
		}
		return 'ok';
	}
);

export default sendManualMessage;
