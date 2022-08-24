import * as functions from 'firebase-functions';
import { CreateListingRequest } from '../../models/requests/listing/create-listing-request';
import { ConfirmationResponse } from '../../models/responses/confirmation-response';
import { Utils } from '../../utils/utils';

export const createListing = functions.https.onCall(async (data, context) => {
	// validate request data
	const requestData = new CreateListingRequest('createListing', data);

	// authenticate user
	const invokerId = Utils.isLoggedIn(context);

	const invoker = await Utils.fetchUser(invokerId);

	console.log(requestData);

	console.log(invoker);

	// parse response
	return new ConfirmationResponse().toJSON();
});
