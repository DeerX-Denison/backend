import { program } from 'commander';
import { Context } from '../../models/context';
import { FirebaseClient } from '../../service/firebase-client';
import { z } from 'zod';
import { NonEmptyString } from '../../../src/models/non-empty-string';
import { Environments } from '../../models/environments';
import { Utils } from '../../../src/utils';
import assert from 'assert';
import { FirebaseError } from '@firebase/util';

export const deleteUser = async (ctx: Context, reqData: any) => {
	await ctx.firebase.signOut();

	try {
		await ctx.firebase.functions('deleteUser')();
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

	await ctx.firebase.signInWithEmailAndPassword(
		reqData.email,
		reqData.password
	);

	const res = await ctx.firebase.functions('deleteUser')();

	assert(Utils.identicalDictionary(res.data, { status: 'ok' }));

	await ctx.firebase.signOut();
};

if (require.main === module) {
	program
		.requiredOption('--email <string>', 'user email')
		.requiredOption('--password <string>', 'user password')
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
			environment: z.nativeEnum(Environments),
			debug: z.boolean().optional().nullable(),
		})
		.parse(program.opts());

	const firebase = new FirebaseClient(opts);

	const ctx = { firebase, ...opts };

	deleteUser(ctx, opts);
}
