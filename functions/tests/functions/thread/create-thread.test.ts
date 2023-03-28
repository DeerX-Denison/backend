import { Context } from '../../models/context';
import assert from 'assert';
import { Utils } from '../../../src/utils';
import { FirebaseError } from '@firebase/util';

export const createThread = async (ctx: Context, opts: any) => {
	await ctx.firebase.signOut();

	try {
		await ctx.firebase.functions('createThread')(opts);
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

	await ctx.firebase.signInWithEmailAndPassword(opts.email, opts.password);

	try {
		await ctx.firebase.functions('createThread')({
			a: 'invalid data',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/invalid-argument');
	}

	const res = await ctx.firebase.functions('createThread')(opts);

	assert(Utils.isDictionary(res.data));

	assert(Utils.isDictionary(res.data.room));

	return res.data.room;
};

if (require.main === module) {
	throw 'Not implemented to be called directly';
}
