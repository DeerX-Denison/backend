import { program } from 'commander';
import { FirebaseClient } from './service/firebase-client';
import { z } from 'zod';
import { Environments } from './models/environments';
import { createTestUser } from './create-test-user.test';
import { NonEmptyString } from '../src/models/non-empty-string';
import { Context } from './models/context';
import { health as healthCheck } from './health.test';
import { createFCMToken } from './create-fcm-token.test';
import { syncUser } from './sync-user.test';
import { deleteFCMToken } from './delete-fcm-token.test';

const main = async (ctx: Context, opts: any) => {
	await healthCheck(ctx, {});

	await createTestUser(ctx, {
		email: opts.email,
		password: opts.password,
		token: opts.token,
	});

	await syncUser(ctx, { email: opts.email, password: opts.password });

	await createFCMToken(ctx, {
		email: opts.email,
		password: opts.password,
		deviceId: opts.deviceId,
		token: opts.fcmToken,
	});

	await deleteFCMToken(ctx, {
		email: opts.email,
		password: opts.password,
		deviceId: opts.deviceId,
	});
};

if (require.main === module) {
	program
		.requiredOption('--email <string>', 'user email')
		.requiredOption('--password <string>', 'user password')
		.requiredOption('--token <string>', 'token to create test user')
		.requiredOption('--device-id <string>', 'user device id')
		.requiredOption('--fcm-token <string>', 'user test fcm token')
		.option(
			'--environment <string>',
			'test environment',
			Environments.development
		)
		.option('--debug', 'run script in debug mode')
		.parse();

	const opts = z
		.object({
			email: NonEmptyString,
			password: NonEmptyString,
			token: NonEmptyString,
			deviceId: NonEmptyString,
			fcmToken: NonEmptyString,
			environment: z.nativeEnum(Environments),
			debug: z.boolean().optional().nullable(),
		})
		.parse(program.opts());

	const context = {
		firebase: new FirebaseClient(opts),
		...opts,
	};

	main(context, opts);
}
