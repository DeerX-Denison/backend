import sgMail from '@sendgrid/mail';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import secrets from '../secrets.json';

/**
 * function to send user a sign in email
 */
const sendSignInEmail = functions.https.onCall(async (data) => {
	sgMail.setApiKey(secrets.sendgrid_key);
	const authLink = await admin
		.auth()
		.generateSignInWithEmailLink(data.email, data.actionCodeSettings);

	try {
		await sgMail.send({
			to: data.email,
			from: secrets.sendgrid_sender,
			templateId: secrets.sendgrid_email_id,
			dynamicTemplateData: { authLink },
			hideWarnings: true,
		});
	} catch (error) {
		throw new functions.https.HttpsError(
			'internal',
			`Fail to send authentication email`,
			error
		);
	}
});

export default sendSignInEmail;
