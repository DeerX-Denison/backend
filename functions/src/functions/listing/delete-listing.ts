import * as functions from 'firebase-functions';
import { DeleteListingRequest } from '../../models/requests/delete-listing-request';
import { Collection } from '../../models/collection-name';
import { Firebase } from '../../services/firebase-service';
import { Utils } from '../../utils/utils';
export const deleteListing = functions.https.onCall(
	async (data: unknown, context) => {
		try {
			// validate request data
			const requestData = DeleteListingRequest.parse(data);

			// authorize user
			const invokerId = Utils.isLoggedIn(context);

			const invoker = await Utils.fetchUser(invokerId);

			Utils.isNotBanned(invoker);

			const listing = await Utils.fetchListing(requestData.id);

			Utils.isSelf(invoker.uid, listing.seller.uid);

			// delete from db
			await Firebase.db
				.collection(Collection.listings)
				.doc(listing.id)
				.delete();
		} catch (error) {
			Utils.errorHandler(error);
		}
	}
);
