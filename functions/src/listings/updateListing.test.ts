import { WrappedFunction } from 'firebase-functions-test/lib/main';
import 'ts-jest';
import { ListingData } from 'types';
import * as myFunctions from '..';
import { testEnv } from '../firebase.config';
import { mockUserInfo as seller } from '../setupTest';

const mockListing: Omit<ListingData, 'createdAt' | 'updatedAt'> = {
	id: 'mock-id-2',
	images: ['mock image url'],
	name: 'mock listing name',
	price: 'mock listing price',
	category: 'BOOKS',
	seller,
	condition: 'BARELY FUNCTIONAL',
	description: 'mock listing description',
	savedBy: 0,
	status: 'posted',
};

const updatedMockListing = { ...mockListing, name: 'updated mock listing' };

describe('Testing update listing', () => {
	let wrapped: WrappedFunction;
	beforeAll(async () => {
		wrapped = testEnv.wrap(myFunctions.updateListing);
	});

	afterEach(() => {
		testEnv.cleanup();
	});

	it('unauthorized call', async () => {
		expect(wrapped(updatedMockListing)).rejects.toEqual(
			new Error('User unauthenticated')
		);
	});

	it('authorized call', async () => {
		await testEnv.wrap(myFunctions.createListing)(mockListing, {
			auth: mockListing.seller,
		});
		await wrapped(updatedMockListing, { auth: mockListing.seller });
	});
});
