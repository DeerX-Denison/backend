import { program } from 'commander';
import { Context } from '../../models/context';
import { FirebaseClient } from '../../service/firebase-client';
import { z } from 'zod';
import { NonEmptyString } from '../../../src/models/non-empty-string';
import { Environments } from '../../models/environments';
import { Utils } from '../../../src/utils/utils';
import assert from 'assert';
import { FirebaseError } from '@firebase/util';
import { UserPronoun } from '../../../src/models/user';
import { Config } from '../../../src/config';
import { createTestUser } from './create-test-user.test';
import { syncUser } from './sync-user.test';
import userData from '../../../src/user/users.json';
import { deleteUser } from './delete-user.test';

export const updateUserProfile = async (ctx: Context, opts: any) => {
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
		await ctx.firebase.functions('updateUserProfile')(opts);
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

	await ctx.firebase.signInWithEmailAndPassword(
		Config.testerEmails[1],
		otherTestUserPassword
	);

	try {
		await ctx.firebase.functions('updateUserProfile')({
			a: 'invalid data',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/invalid-argument');
	}

	const res = await ctx.firebase.functions('updateUserProfile')(opts);

	assert(Utils.isDictionary(res.data));

	assert(Utils.identicalDictionary(res.data, { status: 'ok' }));

	await ctx.firebase.signOut();

	await ctx.firebase.signInWithEmailAndPassword(opts.email, opts.password);

	const res1 = await ctx.firebase.functions('getUserProfile')(newUid);

	assert(Utils.isDictionary(res1.data));

	assert(
		Utils.identicalDictionary(res1.data, {
			uid: newUid,
			email: Config.testerEmails[1],
			displayName: (userData as any)[Config.testerEmails[1]].name,
			photoURL: opts.imageUrl,
			bio: opts.bio,
			pronouns: opts.pronouns,
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
		.requiredOption('--image-url <string>', 'user profile image url')
		.requiredOption('--bio <string>', 'user bio')
		.requiredOption('--pronouns <string>', 'user separated pronouns')
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
			imageUrl: NonEmptyString,
			bio: NonEmptyString,
			pronouns: NonEmptyString.transform((obj) =>
				obj.split(',').map((_) => z.nativeEnum(UserPronoun).parse(_))
			),
			environment: z.nativeEnum(Environments),
			debug: z.boolean().optional().nullable(),
		})
		.parse(program.opts());

	const firebase = new FirebaseClient(opts);

	const context = { firebase, ...opts };

	updateUserProfile(context, opts);
}
