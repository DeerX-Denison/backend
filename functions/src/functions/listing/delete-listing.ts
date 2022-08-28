import * as functions from 'firebase-functions';
import { DeleteListingRequest } from '../../models/requests/delete-listing-request';
import { Collection } from '../../models/collection-name';
import { Firebase } from '../../services/firebase-service';
import { Utils } from '../../utils/utils';
import { ConfirmationResponse } from '../../models/response/confirmation-response';

export const deleteListing = functions.https.onCall(
	async (data: unknown, context) => {
		try {
			// validate request data
			const requestData = DeleteListingRequest.parse(data);

			// authorize user
			const invokerId = Utils.isLoggedIn(context);

			const invoker = await Utils.fetchUser(invokerId);

			Utils.isNotBanned(invoker);

			const isGuest = Utils.isGuest(invoker);

			const listing = await Utils.fetchListing(requestData.id, isGuest);

			Utils.isSelf(invoker.uid, listing.seller.uid);

			// delete listing from db
			await Firebase.db
				.collection(isGuest ? Collection.guest_listings : Collection.listings)
				.doc(listing.id)
				.delete();

			return ConfirmationResponse.parse();
		} catch (error) {
			return Utils.errorHandler(error);
		}
	}
);
