import { Listing } from '../../models/listing/listing';
import { UpdateListingRequest } from '../../models/requests/listing/update-listing-request';
import { UpdateListingResponse } from '../../models/response/listing/update-listing-response';
import { User } from '../../models/user/user';
import { CloudFunction } from '../../services/cloud-functions';

export const updateListing = CloudFunction.onCall(
	async (data: unknown, context) => {
		const invokerId = User.isLoggedIn(context);

		const invoker = await User.get(invokerId);

		User.isNotBanned(invoker);

		const requestData = UpdateListingRequest.parse(data);

		const listing = await Listing.get(requestData.id);

		User.isSeller(invoker, listing);

		await Listing.update(listing.id, {
			...listing,
			...requestData,
			seller: invoker,
		});

		return UpdateListingResponse.parse({ id: requestData.id });
	}
);
