import * as admin from 'firebase-admin';
import { WrappedFunction } from 'firebase-functions-test/lib/main';
import 'ts-jest';
import { ListingData } from 'types';
import * as myFunctions from '..';
import { db, testEnv } from '../firebase.config';
import { mockUserInfo as seller } from '../setupTest';

const baseMockListing: ListingData = {
	id: 'mock-id',
	images: ['mock image url'],
	name: 'mock listing name',
	price: 'mock listing price',
	category: ['BOOKS'],
	seller,
	condition: 'BARELY FUNCTIONAL',
	description: 'mock listing description',
	savedBy: 0,
	status: 'posted',
	createdAt: new admin.firestore.Timestamp(1000, 1000),
	updatedAt: new admin.firestore.Timestamp(1000, 1000),
};

describe('Testing update listing', () => {
	let wrapped: WrappedFunction;
	beforeAll(async () => {
		wrapped = testEnv.wrap(myFunctions.updateListing);
	});

	afterEach(() => {
		testEnv.cleanup();
	});

	it('unauthorized call', async () => {
		await expect(wrapped({})).rejects.toEqual(
			new Error('User unauthenticated')
		);
	});

	it('authorized call', async () => {
		const mockListing = { ...baseMockListing, id: 'authorized-call' };

		const updatedMockListing = { ...mockListing, name: 'updated mock listing' };

		await db.collection('listings').doc(mockListing.id).set(mockListing);
		await expect(
			wrapped(updatedMockListing, { auth: mockListing.seller })
		).resolves.toEqual('ok');
		await db.collection('listings').doc(mockListing.id).delete();
	});

	it.skip('listing is updated', async () => {
		const mockListing = { ...baseMockListing, id: 'listing-is-updated' };
		const updatedMockListing = { ...mockListing, name: 'updated mock listing' };
		await db.collection('listings').doc(mockListing.id).set(mockListing);
		await wrapped(updatedMockListing, { auth: mockListing.seller });
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const dbListing = (
			await db.collection('listings').doc(mockListing.id).get()
		).data() as ListingData;

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { updatedAt, createdAt, ...dbListingg } = dbListing;
		expect(dbListingg).toEqual(updatedMockListing);
		await db.collection('listings').doc(mockListing.id).delete();
	});
});
