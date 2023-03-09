import { Listing } from '../../models/listing/listing';
import { CreateListingRequest } from '../../models/requests/listing/create-listing-request';
import { CreateListingResponse } from '../../models/response/listing/create-listing-response';
import { User } from '../../models/user/user';
import { CloudFunction } from '../../services/cloud-functions';

export const createListing = CloudFunction.onCall(
	async (data: unknown, context) => {
		const invokerId = User.isLoggedIn(context);

		const invoker = await User.get(invokerId);

		User.isNotBanned(invoker);

		const requestData = CreateListingRequest.parse(data);

		const listingId = await Listing.create({
			...requestData,
			seller: invoker,
			soldTo: null,
			likedBy: [],
		});

		return CreateListingResponse.parse({ id: listingId });
	}
);
