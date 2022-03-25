import { WrappedFunction } from 'firebase-functions-test/lib/main';
import 'ts-jest';
import { ListingData } from 'types';
import * as myFunctions from '..';
import { testEnv } from '../firebase.config';

const mockListing: Omit<ListingData, 'createdAt' | 'updatedAt'> = {
	id: 'mock-id-1',
	images: ['mock image url'],
	name: 'mock listing name',
	price: 'mock listing price',
	category: ['BOOKS'],
	seller: {
		email: 'mock email',
		displayName: 'mock display name',
		photoURL: 'mock photo url',
		uid: 'mock uid',
	},
	condition: 'BARELY FUNCTIONAL',
	description: 'mock listing description',
	savedBy: 0,
	status: 'posted',
	likedBy: [],
};

describe('Testing create Listings', () => {
	let wrapped: WrappedFunction;
	beforeAll(() => {
		wrapped = testEnv.wrap(myFunctions.createListing);
	});

	afterEach(() => {
		testEnv.cleanup();
	});

	it('unauthorized call', async () => {
		await expect(wrapped(mockListing)).rejects.toEqual(
			new Error('User unauthenticated')
		);
	});

	it('authorized call', async () => {
		await expect(
			wrapped(mockListing, { auth: mockListing.seller })
		).resolves.toEqual('ok');
	});

	it('empty id', async () => {
		mockListing['id'] = '';
		// suppress console.error, since console.error is expected to run
		const mockConsoleError = jest
			.spyOn(console, 'error')
			.mockImplementation(jest.fn());
		await expect(
			wrapped(mockListing, { auth: mockListing.seller })
		).rejects.toEqual(new Error('Fail to create new listing'));
		expect(mockConsoleError).toHaveBeenCalledTimes(1);
		jest.spyOn(console, 'error').mockRestore();
	});
	it.todo('invalid image url');
	it.todo('empty name');
	it.todo('invalid price');
	it.todo('invalid category');
	it.todo('invalid seller info');
	it.todo('invalid condition');
	it.todo('invalid description (maybe empty?)');
	it.todo('invalid saved by (maybe save as string)');
	it.todo('invalid status (not posted, not privated');
});
