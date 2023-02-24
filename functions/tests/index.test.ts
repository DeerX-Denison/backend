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
import { CreateListingRequest } from '../src/models/requests/create-listing-request';
import { CreateTestUserRequest } from '../src/models/requests/user/create-test-user-request';
import { CreateFCMTokenRequest } from '../src/models/requests/user/create-fcm-token-request';
import { DeleteFCMTokenRequest } from '../src/models/requests/user/delete-fcm-token-request';
import { NonEmptyString } from '../src/models/non-empty-string';

const main = async (ctx: Context, opts: any) => {
	await healthCheck(ctx, {});

	await createTestUser(ctx, opts);

	await syncUser(ctx, opts);

	await createFCMToken(ctx, opts);

	await deleteFCMToken(ctx, opts);

	await createListing(ctx, opts);
};

if (require.main === module) {
	program
		.requiredOption('--email <string>', 'user email')
		.requiredOption('--password <string>', 'user password')
		.requiredOption(
			'--create-test-user-token <string>',
			'token to create test user'
		)
		.requiredOption('--device-id <string>', 'user device id')
		.requiredOption('--fcm-token <string>', 'user test fcm token')
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

	const opts = program.opts();

	const _opts = z
		.object({
			environment: z.nativeEnum(Environments),
			debug: z.boolean().optional().nullable(),
		})
		.merge(CreateTestUserRequest)
		.merge(CreateFCMTokenRequest.omit({ token: true }))
		.merge(z.object({ fcmToken: NonEmptyString }))
		.merge(DeleteFCMTokenRequest.omit({ uid: true }))
		.merge(CreateListingRequest)
		.parse({
			...opts,
			images: opts.images.split(','),
			category: opts.category.split(','),
		});

	const context = {
		firebase: new FirebaseClient(_opts),
		...opts,
	};

	main(context, _opts);
}
