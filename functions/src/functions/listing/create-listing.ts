import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Collection } from '../../models/collection-name';
import { Listing } from '../../models/listing';
import { CreateListingRequest } from '../../models/requests/create-listing-request';
import { Firebase } from '../../services/firebase-service';
import { Utils } from '../../utils/utils';
export const createListing = functions.https.onCall(
	async (data: unknown, context) => {
		try {
			// validate request data
			const requestData = CreateListingRequest.parse(data);

			// authorize user
			const invokerId = Utils.isLoggedIn(context);

			const invoker = await Utils.fetchUser(invokerId);

			Utils.isNotBanned(invoker);

			// create new listing
			const newListing = Listing.parse({
				...requestData,
				seller: invoker,
				savedBy: 0,
				createdAt: admin.firestore.Timestamp.now(),
				updatedAt: admin.firestore.Timestamp.now(),
			});

			// write to db
			await Firebase.db
				.collection(Collection.listings)
				.doc(newListing.id)
				.set({
					...newListing,
					updatedAt: admin.firestore.FieldValue.serverTimestamp(),
					createdAt: admin.firestore.FieldValue.serverTimestamp(),
				});
		} catch (error) {
			Utils.errorHandler(error);
		}
	}
);
