import { MessageData, MessageId, ThreadId } from 'types';
import { msg } from '../firebase.config';
import Logger from '../Logger';
import { fetchUser } from '../utils';
import constructNoti from './constructNoti';
import fetchFCMTokensFromUid from './fetchFCMTokens';

const logger = new Logger();

/**
 * sends notification to all receivers of the newly created message
 * error codes:
 * 0: Can't fetch all token from all receivers
 * 1: Can't send notification to all receivers
 */
const sendNoti = async (
	message: MessageData,
	threadId: ThreadId,
	messageId: MessageId
) => {
	const { membersUid, sender } = message;
	const members = await Promise.all(
		membersUid.map(async (uid) => await fetchUser(uid))
	);
	const notSelfUids = membersUid.filter((uid) => uid !== sender.uid);
	if (notSelfUids.length > 0) {
		notSelfUids.forEach(async (uid) => {
			const tokensData = await fetchFCMTokensFromUid(uid);
			const tokens = tokensData.map((tokenData) => tokenData.token);
			const noti = constructNoti(message, tokens, members, uid);
			try {
				const { responses, successCount, failureCount } =
					await msg.sendMulticast(noti);
				logger.log(`successCount: ${successCount}`);
				logger.log(`failureCount: ${failureCount}`);
				logger.log(responses);
			} catch (error) {
				throw logger.error(
					`[ERROR 1]: Can't send notification to all receivers: ${threadId}/${messageId}`
				);
			}
		});
	}
};
export default sendNoti;
