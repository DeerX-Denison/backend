import { program } from 'commander';
import { FirebaseClient } from './service/firebase-client';
import { z } from 'zod';
import { Context } from 'vm';
import { Environments } from './models/environments';

const main = async (context: Context) => {
	console.log(context);
};

if (require.main === module) {
	program
		.option('--environment <string>', 'test environment', 'development')
		.parse();

	const opts = z
		.object({ environment: z.nativeEnum(Environments) })
		.parse(program.opts());

	const firebaseClient = new FirebaseClient(opts);

	main({ firebaseClient });
}
