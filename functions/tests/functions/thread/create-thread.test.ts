import { Context } from '../../models/context';
import assert from 'assert';
import { Utils } from '../../../src/utils/utils';
import { FirebaseError } from '@firebase/util';
import { createTestUser } from '../user/create-test-user.test';
import { Config } from '../../../src/config';
import { syncUser } from '../user/sync-user.test';
import { deleteUser } from '../user/delete-user.test';

export const createThread = async (ctx: Context, opts: any) => {
	const otherTestUserPassword = 'superSecret';

	await ctx.firebase.signOut();

	try {
		await ctx.firebase.functions('createThread')(opts);
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

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

	const userCredential = await ctx.firebase.signInWithEmailAndPassword(
		opts.email,
		opts.password
	);

	try {
		await ctx.firebase.functions('createThread')({
			a: 'invalid data',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/invalid-argument');
	}

	const res = await ctx.firebase.functions('createThread')({
		id: opts.id,
		membersUid: [userCredential.user.uid, newUid],
	});

	assert(Utils.isDictionary(res.data));

	assert(Utils.isDictionary(res.data.room));

	await deleteUser(ctx, {
		email: Config.testerEmails[1],
		password: otherTestUserPassword,
	});
};

if (require.main === module) {
	throw 'Not implemented to be called directly';
}
