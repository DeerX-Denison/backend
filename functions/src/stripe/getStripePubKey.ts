import * as functions from 'firebase-functions';

const getStripePubKey = functions.https.onCall(() => {
	const pubKey =
		'pk_test_51JkHDbAVkb168ZLcATWC0eCHnymS9WYYZOtRxeCE7obBQBa44fC1eed5eaxANTGJVSZ7RZj2h6enulr24FECYftq00HXGQdTB6';
	return pubKey;
});

export default getStripePubKey;
