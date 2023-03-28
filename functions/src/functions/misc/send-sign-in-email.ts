import { Firebase } from '../../services/firebase';
import { SendSigninEmailRequest } from '../../models/requests/misc/send-sign-in-email-request';
import { CloudFunction } from '../../services/cloud-functions';
import { Config } from '../../config';
import secrets from '../../secrets.json';
import sgMail from '@sendgrid/mail';

/**
 * function to send user a sign in email
 */
export const sendSignInEmail = CloudFunction.onCall(async (data: unknown) => {
	const requestData = SendSigninEmailRequest.parse(data);

	const authLink = await Firebase.auth.generateSignInWithEmailLink(
		requestData.email,
		requestData.actionCodeSettings
	);

	sgMail.setApiKey(secrets.sendgrid_key);

	await sgMail.send({
		to: requestData.email,
		from: Config.emailSender,
		templateId: Config.templateSignInEmailId,
		dynamicTemplateData: { authLink },
		hideWarnings: true,
	});
});
