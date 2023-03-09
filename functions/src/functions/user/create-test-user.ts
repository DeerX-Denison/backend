import { CreateTestUserRequest } from '../../models/requests/user/create-test-user-request';
import { Config } from '../../config';
import { CreateTestUserResponse } from '../../models/response/user/create-test-user-response';
import { AuthError } from '../../models/error/auth-error';
import { CloudFunction } from '../../services/cloud-functions';
import { User } from '../../models/user/user';

export const createTestUser = CloudFunction.onCall(async (data: unknown) => {
	const requestData = CreateTestUserRequest.parse(data);

	if (Config.createTestUserToken === undefined) throw new AuthError();

	if (requestData.token !== Config.createTestUserToken) throw new AuthError();

	const userRecord = await User.create(requestData.email, requestData.password);

	return CreateTestUserResponse.parse({
		uid: userRecord.uid,
		email: requestData.email,
		password: requestData.password,
	});
});
