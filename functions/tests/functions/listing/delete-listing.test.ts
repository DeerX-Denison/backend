import { program } from 'commander';
import { Context } from '../../models/context';
import { FirebaseClient } from '../../service/firebase-client';
import { z } from 'zod';
import { NonEmptyString } from '../../../src/models/non-empty-string';
import { Environments } from '../../models/environments';
import assert from 'assert';
import { Utils } from '../../../src/utils/utils';
import { DeleteListingRequest } from '../../../src/models/requests/delete-listing-request';
import { FirebaseError } from '@firebase/util';
import { Firebase } from '../../../src/services/firebase';
import { Collection } from '../../../src/models/collection-name';

export const deleteListing = async (ctx: Context, opts: any) => {
	await ctx.firebase.signOut();

	try {
		await ctx.firebase.functions('deleteListing')(opts);
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

	await ctx.firebase.signInWithEmailAndPassword(opts.email, opts.password);

	try {
		await ctx.firebase.functions('deleteListing')({
			a: 'invalid data',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/invalid-argument');
	}

	const res = await ctx.firebase.functions('deleteListing')(opts);

	assert(Utils.isDictionary(res.data));

	assert(Utils.identicalDictionary(res.data, { status: 'ok' }));

	const docSnap = await Firebase.db
		.collection(Collection.listings)
		.doc(opts.id)
		.get();

	assert(docSnap.exists === false);
};

if (require.main === module) {
	program
		.requiredOption('--id <string>', 'listing id')
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
		.merge(DeleteListingRequest)
		.parse(program.opts());

	const firebase = new FirebaseClient(opts);

	const ctx = { firebase, ...opts };

	deleteListing(ctx, opts);
}
