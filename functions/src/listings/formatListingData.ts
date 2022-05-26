import { ListingData } from 'types';

/**
 * precondition: listing data pass validListingData() test
 * format input listing data into desireable data
 */
const formatListingData: (oldListingData: ListingData) => ListingData = (
	oldListingData
) => {
	const newListingData: ListingData = {
		id: oldListingData.id,
		images: oldListingData.images,
		name: oldListingData.name.trim(),
		price: oldListingData.price.trim(),
		category: oldListingData.category,
		seller: {
			email: oldListingData.seller.email?.trim(),
			displayName: oldListingData.seller.displayName?.trim(),
			photoURL: oldListingData.seller.photoURL?.trim(),
			uid: oldListingData.seller.uid.trim(),
			disabled: oldListingData.seller.disabled
				? oldListingData.seller.disabled
				: false,
		},
		condition: oldListingData.condition,
		description: oldListingData.description.trim(),
		status: oldListingData.status,
		createdAt: oldListingData.createdAt,
		updatedAt: oldListingData.updatedAt,
		likedBy: oldListingData.likedBy,
	};

	if (
		oldListingData.status === 'sold' &&
		'soldTo' in oldListingData &&
		oldListingData.soldTo
	) {
		newListingData['soldTo'] = oldListingData.soldTo;
	}

	return newListingData;
};

export default formatListingData;
