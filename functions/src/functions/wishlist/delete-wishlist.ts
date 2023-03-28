import { User } from '../../models/user/user';
import { CloudFunction } from '../../services/cloud-functions';
import { DeleteWishlistRequest } from '../../models/requests/wishlist/delete-wishlist-request';
import { DeleteWishlistResponse } from '../../models/response/wishlist/delete-wishlist-response';

export const deleteWishlist = CloudFunction.onCall(
	async (data: unknown, context) => {
		const invokerId = User.isLoggedIn(context);

		const invoker = await User.get(invokerId);

		User.isNotBanned(invoker);

		const requestData = DeleteWishlistRequest.parse(data);

		await User.removeWishlist(invoker.uid, requestData);

		return DeleteWishlistResponse.ok;
	}
);
