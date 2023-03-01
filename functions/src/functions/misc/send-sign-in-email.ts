import sgMail from '@sendgrid/mail';
import { ERROR_MESSAGES } from '../../constants';
import { Logger } from '../../services/logger';
import secrets from '../../secrets.json';
import { ActionCodeSettings } from 'firebase-admin/auth';
import { Firebase } from '../../services/firebase';

/**
 * function to send user a sign in email
 */
export const sendSignInEmail = Firebase.functions.https.onCall(
	async (data: { email: string; actionCodeSettings: ActionCodeSettings }) => {
		if (!('email' in data)) {
			Logger.log(`Missing "email" in data: ${JSON.stringify(data)}`);
			throw new Firebase.functions.https.HttpsError(
				'invalid-argument',
				ERROR_MESSAGES.invalidInput
			);
		}
		if (!('actionCodeSettings' in data)) {
			Logger.log(
				`Missing "actionCodeSettings" in data: ${JSON.stringify(data)}`
			);
			throw new Firebase.functions.https.HttpsError(
				'invalid-argument',
				ERROR_MESSAGES.invalidInput
			);
		}
		if (typeof data.email !== 'string') {
			Logger.log(`Data email is not string: ${JSON.stringify(data.email)}`);
			throw new Firebase.functions.https.HttpsError(
				'invalid-argument',
				ERROR_MESSAGES.invalidInput
			);
		}

		const [...match] = data.email.matchAll(/@denison.edu/g);
		if (match.length !== 1) {
			Logger.log(`Invalid Email Address: ${data.email}`);
			throw new Firebase.functions.https.HttpsError(
				'invalid-argument',
				'Invalid Email Address'
			);
		}

		sgMail.setApiKey(secrets.sendgrid_key);
		let authLink: string;
		try {
			authLink = await Firebase.auth.generateSignInWithEmailLink(
				data.email,
				data.actionCodeSettings
			);
			Logger.log(`Generated auth link: ${data.email}`);
		} catch (error) {
			Logger.error(error);
			Logger.error(`Fail to create authentication link: ${data.email}`);
			throw new Firebase.functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failSendSignInEmail
			);
		}

		try {
			await sgMail.send({
				to: data.email,
				from: secrets.sendgrid_sender,
				templateId: secrets.sendgrid_email_id,
				dynamicTemplateData: { authLink },
				hideWarnings: true,
			});
			Logger.log(`Sent sign in email to: ${data.email}`);
		} catch (error) {
			Logger.error(error);
			Logger.error('Fail to send auth email');
			throw new Firebase.functions.https.HttpsError(
				'internal',
				ERROR_MESSAGES.failSendSignInEmail
			);
		}
	}
);
