import dotenv from 'dotenv';

dotenv.config();

export class Config {
	public static emailPrefix = process.env.EMAIL_PREFIX ?? '@denison.edu';
	public static testerEmails = process.env.TESTERS_EMAIL
		? process.env.TESTERS_EMAIL.split(',').map((_) => _.trim())
		: [];
	public static regions = process.env.CLOUD_FUNCTIONS_REGIONS
		? process.env.CLOUD_FUNCTIONS_REGIONS.split(',').map((_) => _.trim())
		: ['us-central1'];
	public static createTestUserToken =
		process.env.CREATE_TEST_USER_TOKEN ?? 'welcomeToDeerX2023';
}
