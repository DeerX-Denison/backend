import { Context } from '../../models/context';
import assert from 'assert';
import { Utils } from '../../../src/utils';
import { FirebaseError } from '@firebase/util';

export const createMessage = async (ctx: Context, opts: any) => {
	await ctx.firebase.signOut();

	try {
		await ctx.firebase.functions('createMessage')(opts);
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

	await ctx.firebase.signInWithEmailAndPassword(opts.email, opts.password);

	try {
		await ctx.firebase.functions('createMessage')({
			a: 'invalid data',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/invalid-argument');
	}

	const res = await ctx.firebase.functions('createMessage')(opts);

	assert(Utils.isDictionary(res.data));

	assert(Utils.identicalDictionary(res.data, { status: 'ok' }));
};

if (require.main === module) {
	throw 'Not implemented to be called directly';
}
