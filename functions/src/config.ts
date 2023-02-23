import dotenv from 'dotenv';

dotenv.config();

export class Config {
	public static emailPrefix = process.env.EMAIL_PREFIX ?? '@denison.edu';
	public static testerEmails = process.env.TESTER_EMAILS
		? process.env.TESTER_EMAILS.split(',').map((_) => _.trim())
		: [];
	public static regions = [];
	public static createTestUserToken =
		process.env.CREATE_TEST_USER_TOKEN ?? 'welcome-to-deerx';
}
