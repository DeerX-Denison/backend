import { program } from 'commander';
import { Context } from '../../models/context';
import { FirebaseClient } from '../../service/firebase-client';
import { z } from 'zod';
import { NonEmptyString } from '../../../src/models/non-empty-string';
import { Environments } from '../../models/environments';
import assert from 'assert';
import { Utils } from '../../../src/utils/utils';
import { FirebaseError } from '@firebase/util';
import { Firebase } from '../../../src/services/firebase';
import { Collection } from '../../../src/models/collection-name';
import { UpdateListingRequest } from '../../../src/models/requests/listing/update-listing-request';

export const updateListing = async (ctx: Context, opts: any) => {
	await ctx.firebase.signOut();

	try {
		await ctx.firebase.functions('updateListing')(opts);
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

	const userCredential = await ctx.firebase.signInWithEmailAndPassword(
		opts.email,
		opts.password
	);

	try {
		await ctx.firebase.functions('updateListing')({
			a: 'invalid data',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/invalid-argument');
	}

	const res = await ctx.firebase.functions('updateListing')(opts);

	assert(Utils.isDictionary(res.data));

	assert(res.data.id !== undefined);

	assert(typeof res.data.id === 'string');

	const docSnap = await Firebase.db
		.collection(Collection.listings)
		.doc(res.data.id)
		.get();

	assert(docSnap.exists === true);

	const listing = docSnap.data();

	assert(listing !== undefined);

	assert(listing.updatedAt !== undefined);

	assert(listing.createdAt !== undefined);

	delete listing.updatedAt;

	delete listing.createdAt;

	assert(listing.updatedAt === undefined);

	assert(listing.createdAt === undefined);

	assert(
		Utils.identicalDictionary(listing.seller, {
			uid: userCredential.user.uid,
			email: userCredential.user.email,
			displayName: userCredential.user.displayName,
			photoURL: userCredential.user.photoURL,
		})
	);

	delete listing.seller;

	assert(
		Utils.identicalDictionary(listing, {
			id: res.data.id,
			images: opts.images,
			name: opts.name,
			price: opts.price,
			category: opts.category,
			condition: opts.condition,
			description: opts.description,
			likedBy: [],
			status: opts.status,
			soldTo: null,
		})
	);

	await ctx.firebase.signOut();
};

if (require.main === module) {
	program
		.requiredOption('--email <string>', 'user email')
		.requiredOption('--password <string>', 'user password')
		.requiredOption('--id <string>', 'listing id')
		.requiredOption('--images <string>', 'listing images url')
		.requiredOption('--name <string>', 'listing name')
		.requiredOption('--price <string>', 'listing price')
		.requiredOption('--category <string>', 'listing category')
		.requiredOption('--condition <string>', 'listing condition')
		.requiredOption('--description <string>', 'listing description')
		.requiredOption('--status <string>', 'listing status')
		.option('--sold-to <string>', 'listing soldTo')
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
		.merge(UpdateListingRequest)
		.parse(program.opts());

	const firebase = new FirebaseClient(opts);

	const ctx = { firebase, ...opts };

	updateListing(ctx, opts);
}
