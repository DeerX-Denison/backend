import { program } from 'commander';
import { CreateTestUserRequest } from '../src/models/requests/user/create-test-user-request';
import { Context } from './models/context';
import { FirebaseClient } from './service/firebase-client';
import { z } from 'zod';
import { NonEmptyString } from '../src/models/non-empty-string';
import { Environments } from './models/environments';

const createTestUser = async (
	context: Context,
	requestData: CreateTestUserRequest
) => {
	console.log(context);
	console.log(requestData);
};

if (require.main === module) {
	program
		.requiredOption('--email <string>', 'user email')
		.requiredOption('--password <string>', 'user password')
		.requiredOption('--token <string>', 'token to create test user')
		.option('--environment <string>', 'test environment', 'development')
		.parse();

	const opts = z
		.object({
			email: NonEmptyString,
			password: NonEmptyString,
			token: NonEmptyString,
			environment: z.nativeEnum(Environments),
		})
		.parse(program.opts());

	const firebaseClient = new FirebaseClient(opts);

	const context = { firebaseClient };

	createTestUser(context, opts);
}
