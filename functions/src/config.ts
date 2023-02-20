import dotenv from 'dotenv';

dotenv.config();

export class Config {
	public static emailPrefix = process.env.EMAIL_PREFIX ?? '@denison.edu';
	public static testerEmails = process.env.TESTER_EMAILS
		? process.env.TESTER_EMAILS.split(',').map((_) => _.trim())
		: [];
}
