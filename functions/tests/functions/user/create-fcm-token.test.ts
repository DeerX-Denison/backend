import { program } from 'commander';
import { Context } from '../../models/context';
import { FirebaseClient } from '../../service/firebase-client';
import { z } from 'zod';
import { NonEmptyString } from '../../../src/models/non-empty-string';
import { Environments } from '../../models/environments';
import { Firebase } from '../../../src/services/firebase';
import { Collection } from '../../../src/models/collection-name';
import { Utils } from '../../../src/utils/utils';
import assert from 'assert';
import { FirebaseError } from '@firebase/util';

export const createFCMToken = async (ctx: Context, opts: any) => {
	try {
		await ctx.firebase.functions('createFCMToken')(opts);
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

	const userCredential = await ctx.firebase.signInWithEmailAndPassword(
		opts.email,
		opts.password
	);

	try {
		await ctx.firebase.functions('createFCMToken')({
			a: 'invalid data',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/invalid-argument');
	}

	const res = await ctx.firebase.functions('createFCMToken')(opts);

	assert(Utils.identicalDictionary(res.data, { status: 'ok' }));

	const docSnap = await Firebase.db
		.collection(Collection.users)
		.doc(userCredential.user.uid)
		.collection(Collection.fcm_tokens)
		.doc(opts.deviceId)
		.get();

	assert(docSnap.exists === true);

	const token = docSnap.data();

	assert(token !== undefined);

	assert(token.updatedAt !== undefined);

	delete token.updatedAt;

	assert(token.updatedAt === undefined);

	assert(
		Utils.identicalDictionary(token, {
			deviceId: opts.deviceId,
			token: opts.token,
		})
	);
};

if (require.main === module) {
	program
		.requiredOption('--email <string>', 'user email')
		.requiredOption('--password <string>', 'user password')
		.requiredOption('--device-id <string>', 'user device id')
		.requiredOption('--token <string>', 'user test fcm token')
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
			token: NonEmptyString,
			environment: z.nativeEnum(Environments),
			debug: z.boolean().optional().nullable(),
		})
		.parse(program.opts());

	const firebase = new FirebaseClient(opts);

	const context = { firebase, ...opts };

	createFCMToken(context, opts);
}
