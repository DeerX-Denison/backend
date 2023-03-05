import { program } from 'commander';
import { Context } from '../../models/context';
import { FirebaseClient } from '../../service/firebase-client';
import { z } from 'zod';
import { NonEmptyString } from '../../../src/models/non-empty-string';
import { Environments } from '../../models/environments';
import assert from 'assert';
import { Utils } from '../../../src/utils/utils';

export const createTestUser = async (ctx: Context, opts: any) => {
	const res = await ctx.firebase.functions('createTestUser')(opts);

	assert(Utils.isDictionary(res.data));

	assert('uid' in res.data);

	assert(res.data.uid !== undefined);

	assert(typeof res.data.uid === 'string');

	const uid = res.data.uid;

	delete res.data.uid;

	assert(
		Utils.identicalDictionary(res.data, {
			email: opts.email,
			password: opts.password,
		})
	);

	return uid;
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

	const firebase = new FirebaseClient(opts);

	const ctx = { firebase, ...opts };

	createTestUser(ctx, opts);
}
