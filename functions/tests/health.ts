import { program } from 'commander';
import { Context } from './models/context';
import { FirebaseClient } from './service/firebase-client';
import { z } from 'zod';
import { Environments } from './models/environments';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const health = async (context: Context, opts?: unknown) => {
	const res = await context.firebaseClient.callableFunctions('health')();
	if (context.debug) console.log(res.data);
	return res.data;
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

	const firebaseClient = new FirebaseClient(opts);

	const context = { firebaseClient, ...opts };

	health(context);
}
