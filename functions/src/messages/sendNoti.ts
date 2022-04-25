import { MessageData, MessageId, ThreadId, UserInfo } from 'types';
import { msg } from '../firebase.config';
import Logger from '../Logger';
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
	messageId: MessageId,
	members: UserInfo[]
) => {
	const { membersUid, sender } = message;

	const notSelfUids = membersUid.filter((uid) => uid !== sender.uid);
	if (notSelfUids.length > 0) {
		notSelfUids.forEach(async (uid) => {
			const tokensData = await fetchFCMTokensFromUid(uid);
			if (tokensData.length === 0) return;
			const tokens = tokensData.map((tokenData) => tokenData.token);
			const noti = constructNoti(message, tokens, members, uid);
			try {
				const { successCount, failureCount } = await msg.sendMulticast(noti);
				logger.log(`successCount: ${successCount}`);
				logger.log(`failureCount: ${failureCount}`);
			} catch (error) {
				logger.log(error);
				throw logger.error(
					`[ERROR 1]: Can't send notification to all receivers: ${threadId}/${messageId}`
				);
			}
		});
	}
};
export default sendNoti;
