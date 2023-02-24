import { program } from 'commander';
import { Context } from '../../models/context';
import { FirebaseClient } from '../../service/firebase-client';
import { z } from 'zod';
import { NonEmptyString } from '../../../src/models/non-empty-string';
import { Environments } from '../../models/environments';
import assert from 'assert';
import { Utils } from '../../../src/utils/utils';
import { CreateListingRequest } from '../../../src/models/requests/create-listing-request';
import { FirebaseError } from '@firebase/util';
import { Firebase } from '../../../src/services/firebase';
import { Collection } from '../../../src/models/collection-name';

export const createListing = async (ctx: Context, reqData: any) => {
	assert(process.env.LISTING_IMAGES_URL !== undefined);
	assert(process.env.LISTING_NAME !== undefined);
	assert(process.env.LISTING_PRICE !== undefined);
	assert(process.env.LISTING_CATEGORY !== undefined);
	assert(process.env.LISTING_CONDITION !== undefined);
	assert(process.env.LISTING_DESCRIPTION !== undefined);
	assert(process.env.LISTING_STATUS !== undefined);

	try {
		await ctx.firebase.functions('createListing')(reqData);
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

	const userCredential = await ctx.firebase.signInWithEmailAndPassword(
		reqData.email,
		reqData.password
	);

	try {
		await ctx.firebase.functions('createFCMToken')({
			a: 'invalid data',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/invalid-argument');
	}

	const res = await ctx.firebase.functions('createListing')(reqData);

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
			images: process.env.LISTING_IMAGES_URL.split(','),
			name: process.env.LISTING_NAME,
			price: process.env.LISTING_PRICE,
			category: process.env.LISTING_CATEGORY.split(','),
			condition: process.env.LISTING_CONDITION,
			description: process.env.LISTING_DESCRIPTION,
			likedBy: [],
			status: process.env.LISTING_STATUS,
			soldTo: null,
		})
	);
};

if (require.main === module) {
	program
		.requiredOption('--email <string>', 'user email')
		.requiredOption('--password <string>', 'user password')
		.requiredOption('--images <string>', 'listing images url')
		.requiredOption('--name <string>', 'listing name')
		.requiredOption('--price <string>', 'listing price')
		.requiredOption('--category <string>', 'listing category')
		.requiredOption('--condition <string>', 'listing condition')
		.requiredOption('--description <string>', 'listing description')
		.requiredOption('--status <string>', 'listing status')
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
		.merge(CreateListingRequest)
		.parse(program.opts());

	const firebase = new FirebaseClient(opts);

	const ctx = { firebase, ...opts };

	createListing(ctx, opts);
}
