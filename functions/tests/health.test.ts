import { program } from 'commander';
import { Context } from './models/context';
import { FirebaseClient } from './service/firebase-client';
import { z } from 'zod';
import { Environments } from './models/environments';
import assert from 'assert';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const health = async (ctx: Context, reqData?: any) => {
	const res = await ctx.firebase.functions('health')();
	assert(res.data === 'ok');
};

if (require.main === module) {
	program
		.option(
			'--environment <string>',
			'test environment',
			Environments.development
		)
		.option('--debug', 'run script in debug mode')
		.parse();

	const opts = z
		.object({
			environment: z.nativeEnum(Environments),
			debug: z.boolean().optional().nullable(),
		})
		.parse(program.opts());

	const firebase = new FirebaseClient(opts);

	const context = { firebase, ...opts };

	health(context);
}
