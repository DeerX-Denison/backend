import { program } from 'commander';
import { FirebaseClient } from './service/firebase-client';
import { z } from 'zod';
import { Environments } from './models/environments';
import assert from 'assert';
import { createTestUser } from './create-test-user';
import { NonEmptyString } from '../src/models/non-empty-string';
import { Context } from './models/context';
import { Utils } from '../src/utils/utils';
import { health } from './health';

/**
 * Make changes to this constant variable.
 * All the steps will be executed sequentially.
 */
const STEPS: ((context: Context, opts: any) => Promise<void> | void)[] = [
	async (context, opts) => {
		assert((await health(context, opts)) === 'ok');
	},
	async (context, opts) => {
		assert(
			Utils.identicalDictionary(await createTestUser(context, opts), {
				email: opts.email,
				password: opts.password,
			})
		);
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
			environment: z.nativeEnum(Environments),
			debug: z.boolean().optional().nullable(),
		})
		.parse(program.opts());

	const context = {
		firebaseClient: new FirebaseClient(opts),
		...opts,
	};

	main(context, opts);
}
