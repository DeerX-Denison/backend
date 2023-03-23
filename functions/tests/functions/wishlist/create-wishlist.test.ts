import { Context } from '../../models/context';
import assert from 'assert';
import { FirebaseError } from '@firebase/util';
import { Firebase } from '../../../src/services/firebase';
import { Collection } from '../../../src/models/collection-name';
import { Utils } from '../../../src/utils/utils';

export const createWishlist = async (ctx: Context, opts: any) => {
	await ctx.firebase.signOut();

	try {
		await ctx.firebase.functions('createWishlist')(opts);
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

	const cred = await ctx.firebase.signInWithEmailAndPassword(
		opts.email,
		opts.password
	);

	try {
		await ctx.firebase.functions('createWishlist')({
			a: 'invalid data',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/invalid-argument');
	}

	const res = await ctx.firebase.functions('createWishlist')(opts);

	assert(res.data === 'ok');

	const updatedListing = (
		await Firebase.db.collection(Collection.listings).doc(opts.id).get()
	).data();

	const newWishlist = (
		await Firebase.db
			.collection(Collection.users)
			.doc(cred.user.uid)
			.collection(Collection.wishlist)
			.doc(opts.id)
			.get()
	).data();

	assert(Utils.isDictionary(updatedListing));

	assert(Utils.isDictionary(newWishlist));

	assert(Utils.isDictionary(newWishlist.seller));

	assert(
		Utils.identicalDictionary(newWishlist.seller, {
			uid: cred.user.uid,
			photoURL: cred.user.photoURL,
			displayName: cred.user.displayName,
			email: cred.user.email,
		})
	);

	delete newWishlist.seller;

	delete newWishlist.addedAt;

	assert(
		Utils.identicalDictionary(newWishlist, {
			id: opts.id,
			thumbnail: opts.thumbnail,
			name: opts.name,
			price: opts.price,
			searchableKeyword: Utils.getAllSubstrings(opts.name),
		})
	);

	assert(Array.isArray(updatedListing.likedBy));

	assert(updatedListing.likedBy.includes(cred.user.uid));
};

if (require.main === module) {
	throw 'Not implemented to be called directly';
}
