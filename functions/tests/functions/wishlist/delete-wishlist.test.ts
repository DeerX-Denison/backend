import { Context } from '../../models/context';
import assert from 'assert';
import { FirebaseError } from '@firebase/util';
import { Firebase } from '../../../src/services/firebase';
import { Collection } from '../../../src/models/collection-name';
import { Utils } from '../../../src/utils/utils';

export const deleteWishlist = async (ctx: Context, opts: any) => {
	await ctx.firebase.signOut();

	try {
		await ctx.firebase.functions('deleteWishlist')(opts);
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

	const cred = await ctx.firebase.signInWithEmailAndPassword(
		opts.email,
		opts.password
	);

	try {
		await ctx.firebase.functions('deleteWishlist')({
			a: 'invalid data',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/invalid-argument');
	}

	const res = await ctx.firebase.functions('deleteWishlist')(opts.id);

	assert(res.data === 'ok');

	const updatedListing = (
		await Firebase.db.collection(Collection.listings).doc(opts.id).get()
	).data();

	assert(Utils.isDictionary(updatedListing));

	assert(Array.isArray(updatedListing.likedBy));

	assert(!updatedListing.likedBy.includes(cred.user.uid));
};

if (require.main === module) {
	throw 'Not implemented to be called directly';
}
