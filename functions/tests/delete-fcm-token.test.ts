import { program } from 'commander';
import { Context } from './models/context';
import { FirebaseClient } from './service/firebase-client';
import { z } from 'zod';
import { NonEmptyString } from '../src/models/non-empty-string';
import { Environments } from './models/environments';
import { Firebase } from '../src/services/firebase';
import { Collection } from '../src/models/collection-name';
import assert from 'assert';
import { Utils } from '../src/utils/utils';
import { FirebaseError } from '@firebase/util';

export const deleteFCMToken = async (ctx: Context, reqData: any) => {
	assert(process.env.TESTER_DEVICE_ID !== undefined);

	try {
		await ctx.firebase.functions('deleteFCMToken')({
			...reqData,
			uid: 'fake id',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

	const userCredential = await ctx.firebase.signInWithEmailAndPassword(
		reqData.email,
		reqData.password
	);

	try {
		await ctx.firebase.functions('deleteFCMToken')({
			a: 'invalid data',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/invalid-argument');
	}

	const res = await ctx.firebase.functions('deleteFCMToken')({
		...reqData,
		uid: userCredential.user.uid,
	});

	assert(Utils.identicalDictionary(res.data, { status: 'ok' }));

	const docSnap = await Firebase.db
		.collection(Collection.users)
		.doc(userCredential.user.uid)
		.collection(Collection.fcm_tokens)
		.doc(process.env.TESTER_DEVICE_ID)
		.get();

	assert(docSnap.exists === false);
};

if (require.main === module) {
	program
		.requiredOption('--email <string>', 'user email')
		.requiredOption('--password <string>', 'user password')
		.requiredOption('--device-id <string>', 'user device id')
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
			environment: z.nativeEnum(Environments),
			debug: z.boolean().optional().nullable(),
		})
		.parse(program.opts());

	const firebase = new FirebaseClient(opts);

	const context = { firebase, ...opts };

	deleteFCMToken(context, {
		...opts,
		deviceId: opts.deviceId,
	});
}
