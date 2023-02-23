import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { Collection } from '../../models/collection-name';
import { Listing } from '../../models/listing';
import { CreateListingRequest } from '../../models/requests/create-listing-request';
import { Firebase } from '../../services/firebase';
import { Utils } from '../../utils/utils';

export const createListing = Firebase.functions.https.onCall(
	async (data: unknown, context) => {
		try {
			// validate request data
			const requestData = CreateListingRequest.parse(data);

			// authorize user
			const invokerId = Utils.isLoggedIn(context);

			const invoker = await Utils.fetchUser(invokerId);

			Utils.isNotBanned(invoker);

			// create new listing
			const newListing = Listing.parse({
				...requestData,
				seller: invoker,
				soldTo: null,
				likedBy: [],
				createdAt: Firebase.serverTime(),
				updatedAt: Firebase.serverTime(),
			});

			// write to db
			await Firebase.db
				.collection(
					Utils.isGuest(invoker)
						? Collection.guest_listings
						: Collection.listings
				)
				.doc(newListing.id)
				.set(newListing);

			return ConfirmationResponse.parse();
		} catch (error) {
			return Utils.errorHandler(error);
		}
	}
);
