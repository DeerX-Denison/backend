import { UserRecord } from 'firebase-functions/v1/auth';
import { Firebase } from '../../services/firebase-service';
import { CreateTestUserRequest } from '../../models/requests/user/create-test-user-request';
import { Config } from '../../config';
import { InternalError } from '../../models/error/internal-error';
import { CreateTestUserResponse } from '../../models/response/user/create-test-user-response';
import { AuthError } from '../../models/error/auth-error';

export const createTestUser = Firebase.functions.https.onCall(
	async (data: unknown) => {
		try {
			// parse incoming data
			const requestData = CreateTestUserRequest.parse(data);

			// authorize request
			if (requestData.token !== Config.createTestUserToken)
				throw new AuthError();

			// create user
			let userRecord: UserRecord;
			try {
				userRecord = await Firebase.auth.createUser({
					email: requestData.email,
					password: requestData.password,
				});
			} catch (error) {
				throw new InternalError(error);
			}

			// parse response
			return CreateTestUserResponse.parse({
				uid: userRecord.uid,
				email: requestData.email,
				password: requestData.password,
			});
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
);
