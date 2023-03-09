import { DeleteListingRequest } from '../../models/requests/listing/delete-listing-request';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { User } from '../../models/user/user';
import { Listing } from '../../models/listing/listing';
import { CloudFunction } from '../../services/cloud-functions';
import { CloudStorage } from '../../services/cloud-storage';

export const deleteListing = CloudFunction.onCall(
	async (data: unknown, context) => {
		const invokerId = User.isLoggedIn(context);

		const invoker = await User.get(invokerId);

		User.isNotBanned(invoker);

		const requestData = DeleteListingRequest.parse(data);

		const listing = await Listing.get(requestData.id);

		User.isSeller(invoker, listing);

		const imageRefs = listing.images.map(CloudStorage.extractObjectRefFromUrl);

		await Promise.all(imageRefs.map(CloudStorage.delete));

		await Listing.delete(listing.id);

		return ConfirmationResponse.parse();
	}
);
