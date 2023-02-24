import { program } from 'commander';
import { Context } from './models/context';
import { FirebaseClient } from './service/firebase-client';
import { z } from 'zod';
import { NonEmptyString } from '../src/models/non-empty-string';
import { Environments } from './models/environments';

export const createFCMToken = async (ctx: Context, reqData: any) => {
	await ctx.firebase.signInWithEmailAndPassword(
		reqData.email,
		reqData.password
	);

	const res = await ctx.firebase.functions('createFCMToken')(reqData);

	if (ctx.debug) console.log(res.data);

	return res.data;
};

if (require.main === module) {
	program
		.requiredOption('--email <string>', 'user email')
		.requiredOption('--password <string>', 'user password')
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
			deviceId: NonEmptyString,
			fcmToken: NonEmptyString,
			environment: z.nativeEnum(Environments),
			debug: z.boolean().optional().nullable(),
		})
		.parse(program.opts());

	const firebase = new FirebaseClient(opts);

	const context = { firebase, ...opts };

	createFCMToken(context, {
		...opts,
		deviceId: opts.deviceId,
		token: opts.fcmToken,
	});
}
