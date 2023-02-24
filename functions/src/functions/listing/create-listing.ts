import { Collection } from '../../models/collection-name';
import { Listing } from '../../models/listing';
import { CreateListingRequest } from '../../models/requests/create-listing-request';
import { Firebase } from '../../services/firebase';
import { Utils } from '../../utils/utils';
import { CreateListingResponse } from '../../models/response/listing/create-listing-response';

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
			const newListing = Listing.omit({
				updatedAt: true,
				createdAt: true,
			}).parse({
				...requestData,
				id: Utils.randomId(),
				seller: invoker,
				soldTo: null,
				likedBy: [],
			});

			// write to db
			await Firebase.db
				.collection(
					Utils.isGuest(invoker)
						? Collection.guest_listings
						: Collection.listings
				)
				.doc(newListing.id)
				.set({
					...newListing,
					createdAt: Firebase.serverTime(),
					updatedAt: Firebase.serverTime(),
				});

			return CreateListingResponse.parse({ id: newListing.id });
		} catch (error) {
			return Utils.errorHandler(error);
		}
	}
);
