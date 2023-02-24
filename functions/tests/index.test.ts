import { program } from 'commander';
import { FirebaseClient } from './service/firebase-client';
import { z } from 'zod';
import { Environments } from './models/environments';
import assert from 'assert';
import { createTestUser } from './create-test-user.test';
import { NonEmptyString } from '../src/models/non-empty-string';
import { Context } from './models/context';
import { Utils } from '../src/utils/utils';
import { health } from './health.test';
import { createFCMToken } from './create-fcm-token.test';

/**
 * Make changes to this constant variable.
 * All the steps will be executed sequentially.
 */
const STEPS: ((ctx: Context, opts: any) => Promise<void> | void)[] = [
	async (ctx, opts) => {
		assert((await health(ctx, opts)) === 'ok');
	},
	async (ctx, opts) => {
		assert(
			Utils.identicalDictionary(await createTestUser(ctx, opts), {
				email: opts.email,
				password: opts.password,
			})
		);
	},
	async (ctx, opts) => {
		await createFCMToken(ctx, opts);
	},
];

const main = async (context: Context, opts: any) => {
	for (let i = 0; i < STEPS.length; i++) {
		const step = STEPS[i];
		await step(context, opts);
		console.log(`Step ${i} Passes`);
	}
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
