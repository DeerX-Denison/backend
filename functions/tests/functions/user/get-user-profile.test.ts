import { program } from 'commander';
import { Context } from '../../models/context';
import { FirebaseClient } from '../../service/firebase-client';
import { z } from 'zod';
import { NonEmptyString } from '../../../src/models/non-empty-string';
import { Environments } from '../../models/environments';
import { Utils } from '../../../src/utils/utils';
import assert from 'assert';
import { FirebaseError } from '@firebase/util';
import { createTestUser } from './create-test-user.test';
import { Config } from '../../../src/config';
import { syncUser } from './sync-user.test';
import userData from '../../../src/user/users.json';
import { deleteUser } from './delete-user.test';

export const getUserProfile = async (ctx: Context, opts: any) => {
	const otherTestUserPassword = 'superSecret';

	await ctx.firebase.signOut();

	const newUid = await createTestUser(ctx, {
		...opts,
		email: Config.testerEmails[1],
		password: otherTestUserPassword,
		token: Config.createTestUserToken,
	});

	await syncUser(ctx, {
		email: Config.testerEmails[1],
		password: otherTestUserPassword,
	});

	try {
		await ctx.firebase.functions('getUserProfile')(newUid);
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

	await ctx.firebase.signInWithEmailAndPassword(opts.email, opts.password);

	try {
		await ctx.firebase.functions('getUserProfile')({
			a: 'invalid data',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/invalid-argument');
	}

	const res = await ctx.firebase.functions('getUserProfile')(newUid);

	assert(Utils.isDictionary(res.data));

	assert(
		Utils.identicalDictionary(res.data, {
			uid: newUid,
			email: Config.testerEmails[1],
			photoURL: (userData as any)[Config.testerEmails[1]].img,
			displayName: (userData as any)[Config.testerEmails[1]].name,
		})
	);

	await ctx.firebase.signOut();

	await deleteUser(ctx, {
		email: Config.testerEmails[1],
		password: otherTestUserPassword,
	});
};

if (require.main === module) {
	program
		.requiredOption('--email <string>', 'user email')
		.requiredOption('--password <string>', 'user password')
		.requiredOption('--uid <string>', 'target user id')
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
			uid: NonEmptyString,
			environment: z.nativeEnum(Environments),
			debug: z.boolean().optional().nullable(),
		})
		.parse(program.opts());

	const firebase = new FirebaseClient(opts);

	const context = { firebase, ...opts };

	getUserProfile(context, opts);
}
