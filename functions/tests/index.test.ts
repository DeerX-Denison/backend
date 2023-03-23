import { program } from 'commander';
import { FirebaseClient } from './service/firebase-client';
import { z } from 'zod';
import { Environments } from './models/environments';
import { createTestUser } from './functions/user/create-test-user.test';
import { Context } from './models/context';
import { health as healthCheck } from './functions/misc/health.test';
import { createFCMToken } from './functions/user/create-fcm-token.test';
import { syncUser } from './functions/user/sync-user.test';
import { deleteFCMToken } from './functions/user/delete-fcm-token.test';
import { createListing } from './functions/listing/create-listing.test';
import { Config } from '../src/config';
import assert from 'assert';
import { updateListing } from './functions/listing/update-listing.test';
import { deleteListing } from './functions/listing/delete-listing.test';
import { deleteUser } from './functions/user/delete-user.test';
import { getUserProfile } from './functions/user/get-user-profile.test';
import { updateFCMToken } from './functions/user/update-fcm-token.test';
import { updateUserProfile } from './functions/user/update-user-profile.test';
import { createThread } from './functions/thread/create-thread.test';
import { createMessage } from './functions/message/create-message.test';
import data from '../src/user/users.json';
import { createWishlist } from './functions/wishlist/create-wishlist.test';
import { deleteWishlist } from './functions/wishlist/delete-wishlist.test';

const main = async (ctx: Context, opts: any) => {
	assert(Config.createTestUserToken);

	const credentials = {
		email: Config.testerEmails[0],
		password: 'superSecret',
	};
	await healthCheck(ctx, {});

	const uid = await createTestUser(ctx, {
		...opts,
		...credentials,
		token: Config.createTestUserToken,
	});

	await syncUser(ctx, { ...opts, ...credentials });

	await createFCMToken(ctx, {
		...opts,
		...credentials,
		deviceId: 'test-device-id',
		token: 'test-fcm-token',
	});

	await updateFCMToken(ctx, {
		...opts,
		...credentials,
		deviceId: 'test-device-id',
		token: 'updated-test-fcm-token',
	});

	await deleteFCMToken(ctx, {
		...opts,
		...credentials,
		deviceId: 'test-device-id',
		token: 'test-fcm-token',
	});

	const otherUid = await createTestUser(ctx, {
		...opts,
		email: Config.testerEmails[1],
		password: credentials.password,
		token: Config.createTestUserToken,
	});

	await syncUser(ctx, {
		...opts,
		email: Config.testerEmails[1],
		password: credentials.password,
	});

	const thread = await createThread(ctx, {
		...opts,
		...credentials,
		id: 'test-thread-id',
		membersUid: [uid, otherUid],
	});

	await createMessage(ctx, {
		...opts,
		...credentials,
		threadPreviewData: { id: thread.id, membersUid: thread.membersUid },
		message: {
			id: 'test-message',
			sender: {
				uid,
				email: Config.testerEmails[0],
				displayName: (data as any)[Config.testerEmails[0]].name,
				photoURL: (data as any)[Config.testerEmails[1]].img,
			},
			time: ctx.firebase.localTime(),
			contentType: ['text'],
			content: 'test message foo bar',
			membersUid: thread.membersUid,
			threadName: thread.name,
			seenAt: {},
			refs: [],
		},
	});

	await deleteUser(ctx, {
		...opts,
		email: Config.testerEmails[1],
		password: credentials.password,
	});

	const listingId = await createListing(ctx, {
		...opts,
		...credentials,
		id: 'test-listing-id',
		images: [
			'https://i.ibb.co/Y26TN8k/denison-icon-red.jpg',
			'https://i.ibb.co/JKS8DzC/default-profile-photo.jpg',
			'https://i.ibb.co/M66vK2N/deerx-invalid-image-content.jpg',
		],
		name: 'test listing',
		price: '123',
		category: ['FASHION', 'ELECTRONIC'],
		condition: 'BRAND NEW',
		description: 'test description',
		status: 'posted',
	});

	await createWishlist(ctx, {
		...opts,
		...credentials,
		id: listingId,
		thumbnail: 'https://i.ibb.co/Y26TN8k/denison-icon-red.jpg',
		name: 'test listing',
		price: '123',
	});

	await deleteWishlist(ctx, { ...opts, ...credentials, id: listingId });

	await updateListing(ctx, {
		...opts,
		...credentials,
		id: listingId,
		images: [
			'https://i.ibb.co/Y26TN8k/denison-icon-red.jpg',
			'https://i.ibb.co/JKS8DzC/default-profile-photo.jpg',
			'https://i.ibb.co/M66vK2N/deerx-invalid-image-content.jpg',
		],
		name: 'updated test listing',
		price: '321',
		category: ['FASHION', 'ELECTRONIC'],
		condition: 'BRAND NEW',
		description: 'test description',
		status: 'saved',
	});

	await deleteListing(ctx, { ...opts, ...credentials, id: listingId });

	await getUserProfile(ctx, { ...opts, ...credentials });

	await updateUserProfile(ctx, {
		...opts,
		...credentials,
		imageUrl: 'https://i.ibb.co/Y26TN8k/denison-icon-red.jpg',
		bio: 'test user bio',
		pronouns: ['HE', 'HIM'],
	});

	await deleteUser(ctx, { ...opts, ...credentials });
};

if (require.main === module) {
	program
		.option(
			'--environment <string>',
			'test environment',
			Environments.development
		)
		.option('--debug', 'run script in debug mode')
		.parse();

	const opts = program.opts();

	const _opts = z
		.object({
			environment: z.nativeEnum(Environments),
			debug: z.boolean().optional().nullable(),
		})
		.parse(opts);

	const context = {
		firebase: new FirebaseClient(_opts),
		...opts,
	};

	main(context, _opts);
}
