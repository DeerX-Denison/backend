import { CreateWishlistRequest } from '../../models/requests/wishlist/create-wishlist-request';
import { User } from '../../models/user/user';
import { CloudFunction } from '../../services/cloud-functions';
import { Wishlist } from '../../models/wishlist/wishlist';
import { CreateWishlistResponse } from '../../models/response/wishlist/create-wishlist-response';
import { Firebase } from '../../services/firebase';
import { Utils } from '../../utils';

export const createWishlist = CloudFunction.onCall(
	async (data: unknown, context) => {
		const invokerId = User.isLoggedIn(context);

		const invoker = await User.get(invokerId);

		User.isNotBanned(invoker);

		const requestData = CreateWishlistRequest.parse(data);

		const newWishlist = Wishlist.parse({
			...requestData,
			seller: invoker,
			addedAt: Firebase.localTime(),
			searchableKeyword: Utils.getAllSubstrings(requestData.name),
		});

		await User.addWishlist(invoker.uid, newWishlist);

		return CreateWishlistResponse.ok;
	}
);
