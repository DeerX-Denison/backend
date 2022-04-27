import { ListingData } from 'types';

/**
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
	return newListingData;
};

export default formatListingData;
