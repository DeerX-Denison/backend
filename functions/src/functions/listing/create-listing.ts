import { FirebaseError } from '@firebase/util';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { CallableContext } from 'firebase-functions/v1/https';
import { ZodError } from 'zod';
import { InternalError } from '../../models/error/internal-error';
import { ValidationError } from '../../models/error/validation-error';
import { Listing } from '../../models/listing';
import { CreateListingRequest } from '../../models/requests/create-listing-request';
import { Firebase } from '../../services/firebase-service';
export const createListing = functions.https.onCall(
	async (data: any, context: CallableContext) => {
		try {
			// validate request data
			const requestData = CreateListingRequest.parse(data);

			// authorize user

			// create new listing
			const newListing = Listing.parse({
				...requestData,
				seller: { uid: 'seller-id-1' },
				savedBy: 0,
				createdAt: admin.firestore.Timestamp.now(),
				updatedAt: admin.firestore.Timestamp.now(),
			});

			// write to
			await Firebase.db
				.collection('listings')
				.doc(newListing.id)
				.set({
					...newListing,
					updatedAt: admin.firestore.FieldValue.serverTimestamp(),
					createdAt: admin.firestore.FieldValue.serverTimestamp(),
				});
		} catch (error) {
			if (error instanceof ZodError) {
				throw new ValidationError(error);
			} else if (error instanceof FirebaseError) {
				throw new InternalError(error);
			} else {
				throw new InternalError(error);
			}
		}
	}
);
