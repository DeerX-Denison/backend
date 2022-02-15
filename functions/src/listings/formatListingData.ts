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
			displayName: oldListingData.seller.displayName,
			photoURL: oldListingData.seller.photoURL,
			uid: oldListingData.seller.uid.trim(),
		},
		condition: oldListingData.condition,
		description: oldListingData.description.trim(),
		savedBy: oldListingData.savedBy,
		status: oldListingData.status,
		createdAt: oldListingData.createdAt,
		updatedAt: oldListingData.updatedAt,
	};
	return newListingData;
};

export default formatListingData;
