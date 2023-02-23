import Logger from '../Logger';
import { main as deleteAnonymousUser } from './deleteAnonymousUser';
import { Firebase } from '../services/firebase';

const logger = new Logger();
const deleteOldAnonUsers = Firebase.functions.pubsub
	.schedule('0 0 * * *')
	.timeZone('America/New_York')
	.onRun(async () => {
		const allUsers = await Firebase.auth.listUsers();
		const anonUserRecords = allUsers.users.filter(
			(userRecord) => userRecord.providerData.length === 0
		);

		anonUserRecords.forEach(async (userRecord) => {
			if (!userRecord.metadata.lastRefreshTime) {
				logger.log(`User was never active: ${userRecord}`);
				try {
					await deleteAnonymousUser({ uid: userRecord.uid });
				} catch (error) {
					logger.error(error);
					logger.error(`Fail to delete anonymous user: ${userRecord.uid}`);
				}
				return;
			}

			const lastActive = new Date(userRecord.metadata.lastRefreshTime);
			const curTime = new Date(Date.now());
			const milliElapsed = curTime.valueOf() - lastActive.valueOf();
			const oneMilliSec = 1;
			const oneSecond = oneMilliSec * 1000;
			const oneHour = oneSecond * 3600;
			const oneDay = oneHour * 24;
			if (milliElapsed > 7 * oneDay) {
				logger.log(`User inactive for more than 7 days: ${userRecord.uid}`);
				try {
					await deleteAnonymousUser({ uid: userRecord.uid });
				} catch (error) {
					logger.error(error);
					logger.error(`Fail to delete anonymous user: ${userRecord.uid}`);
				}
				return;
			}
		});
	});

export default deleteOldAnonUsers;
