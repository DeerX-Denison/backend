import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import Logger from '../Logger';
import secrets from '../secrets.json';

const logger = new Logger();

const confirmPayment = functions.https.onCall(async () => {
	const stripe = new Stripe(secrets.stripe_sv_key, {
		apiVersion: '2020-08-27',
		typescript: true,
	});
	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: 5000, //$50
			currency: 'usd',
		});
		return paymentIntent.client_secret;
	} catch (error) {
		logger.log(error);
		throw error;
	}
});

export default confirmPayment;
