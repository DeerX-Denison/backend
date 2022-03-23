import { messaging } from 'firebase-admin';
import { MessageData, UserInfo } from 'types';

/**
 * construct and return a multicast message to be sent from input message data, all token of the provided uid
 */
const constructNoti = (
	message: MessageData,
	tokens: string[],
	members: UserInfo[],
	uid: string
) => {
	if (message.contentType === 'text') {
		const title = message.threadName[uid];
		const body = message.content;
		const noti: messaging.MulticastMessage = {
			notification: {
				title,
				body,
			},
			apns: {
				payload: {
					aps: {
						badge: 0,
						sound: 'default',
					},
				},
			},
			data: {
				type: 'inbox message',
				members: JSON.stringify(members),
			},
			tokens,
		};
		return noti;
	} else {
		throw 'Not implemented';
	}
};

export default constructNoti;
