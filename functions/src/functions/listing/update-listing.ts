import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { ConfirmationResponse } from '../../models/response/confirmation-response';
import { Collection } from '../../models/collection-name';
import { Listing, ListingStatus } from '../../models/listing';
import { Firebase } from '../../services/firebase-service';
import { Utils } from '../../utils/utils';
import { UpdateListingRequest } from '../../models/requests/update-listing-request';

export const updateListing = functions.https.onCall(
	async (data: unknown, context) => {
		try {
			// validate request data
			const requestData = UpdateListingRequest.parse(data);

			// authorize user
			const invokerId = Utils.isLoggedIn(context);

			const invoker = await Utils.fetchUser(invokerId);

			Utils.isNotBanned(invoker);

			const isGuest = Utils.isGuest(invoker);

			const listing = await Utils.fetchListing(requestData.id, isGuest);

			Utils.isSelf(invoker.uid, listing.seller.uid);

			// generate updated listing
			const updatedListing = Listing.omit({ createdAt: true }).parse({
				...listing,
				...requestData,
				seller: invoker,
			});

			if (updatedListing.status !== ListingStatus.SOLD) {
				updatedListing.soldTo = null;
			}

			// write to db
			await Firebase.db
				.collection(isGuest ? Collection.guest_listings : Collection.listings)
				.doc(updatedListing.id)
				.update({
					...updatedListing,
					updatedAt: admin.firestore.FieldValue.serverTimestamp(),
				});

			// check for removed images to delete from storage
			const deletedImagesUrl = listing.images.filter(
				(url) => !updatedListing.images.includes(url)
			);

			await Promise.all(
				deletedImagesUrl
					.map(Utils.extractImageRefFromUrl)
					.map(Utils.deleteImage)
			);

			return ConfirmationResponse.parse();
		} catch (error) {
			return Utils.errorHandler(error);
		}
	}
);
