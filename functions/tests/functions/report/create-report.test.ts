import { Context } from '../../models/context';
import assert from 'assert';
import { Utils } from '../../../src/utils/utils';
import { FirebaseError } from '@firebase/util';
import { Firebase } from '../../../src/services/firebase';
import { Collection } from '../../../src/models/collection-name';

export const createReport = async (ctx: Context, opts: any) => {
	await ctx.firebase.signOut();

	try {
		await ctx.firebase.functions('createReport')(opts);
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/permission-denied');
	}

	const cred = await ctx.firebase.signInWithEmailAndPassword(
		opts.email,
		opts.password
	);

	try {
		await ctx.firebase.functions('createReport')({
			a: 'invalid data',
		});
	} catch (error) {
		assert(error instanceof FirebaseError);
		assert(error.code === 'functions/invalid-argument');
	}

	const res = await ctx.firebase.functions('createReport')(opts);

	assert(res.data === 'ok');

	const querySnap = await Firebase.db.collection(Collection.reports).get();

	assert(querySnap.docs.length === 1);

	const report = querySnap.docs[0].data();

	assert(Utils.isDictionary(report));

	assert(Utils.isDictionary(report.reporter));

	assert(
		Utils.identicalDictionary(report.reporter, {
			uid: cred.user.uid,
			photoURL: cred.user.photoURL,
			displayName: cred.user.displayName,
			email: cred.user.email,
		})
	);

	delete report.reporter;

	assert(Utils.isDictionary(report.evidence));

	delete report.evidence;

	delete report.createdAt;

	delete report.id;

	assert(
		Utils.identicalDictionary(report, {
			type: opts.type,
			detail: opts.detail,
			reportedUid: cred.user.uid,
		})
	);
};

if (require.main === module) {
	throw 'Not implemented to be called directly';
}
