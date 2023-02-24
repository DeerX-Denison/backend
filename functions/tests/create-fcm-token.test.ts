import { program } from 'commander';
import { Context } from './models/context';
import { FirebaseClient } from './service/firebase-client';
import { z } from 'zod';
import { NonEmptyString } from '../src/models/non-empty-string';
import { Environments } from './models/environments';
import { Firebase } from '../src/services/firebase';
import { Collection } from '../src/models/collection-name';
import { Utils } from '../src/utils/utils';
import assert from 'assert';

export const createFCMToken = async (ctx: Context, reqData: any) => {
	assert(process.env.TESTER_DEVICE_ID !== undefined);
	assert(process.env.TESTER_FCM_TOKEN !== undefined);

	const userCredential = await ctx.firebase.signInWithEmailAndPassword(
		reqData.email,
		reqData.password
	);

	const res = await ctx.firebase.functions('createFCMToken')(reqData);

	assert(Utils.identicalDictionary(res.data, { status: 'ok' }));

	const docSnap = await Firebase.db
		.collection(Collection.users)
		.doc(userCredential.user.uid)
		.collection(Collection.fcm_tokens)
		.doc(process.env.TESTER_DEVICE_ID)
		.get();

	assert(docSnap.exists === true);

	const token = docSnap.data();

	assert(token !== undefined);

	assert(token.updatedAt !== undefined);

	delete token.updatedAt;

	assert(token.updatedAt === undefined);

	console.log(token);

	assert(
		Utils.identicalDictionary(token, {
			deviceId: process.env.TESTER_DEVICE_ID,
			token: process.env.TESTER_FCM_TOKEN,
		})
	);
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
