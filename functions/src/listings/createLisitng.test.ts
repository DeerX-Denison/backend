import { WrappedFunction } from 'firebase-functions-test/lib/main';
import 'ts-jest';
import { ListingData } from 'types';
import { db, testEnv } from '../firebase.config';
import * as myFunctions from '../index';
import * as fetchUser from '../utils/fetchUser';

const mockFetchUser = fetchUser.default as jest.Mock;
jest.mock('../utils/fetchUser', () => ({
	__esModule: true,
	default: jest.fn(),
}));

const mockListing: Omit<ListingData, 'createdAt' | 'updatedAt'> = {
	id: 'mock id',
	images: ['mock image url'],
	name: 'mock listing name',
	price: 'mock listing price',
	category: 'BOOKS',
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
};

describe('Testing create Listings', () => {
	let wrapped: WrappedFunction;
	beforeAll(() => {
		wrapped = testEnv.wrap(myFunctions.createListing);
	});

	afterEach(() => {
		mockFetchUser.mockReset();
		testEnv.cleanup();
	});

	it('unauthorized call', async () => {
		expect(wrapped(mockListing)).rejects.toEqual(
			new Error('User unauthenticated')
		);
	});

	it('authorized call', async () => {
		mockFetchUser.mockReturnValue(mockListing.seller);
		expect(wrapped(mockListing, { auth: mockListing.seller })).resolves.toEqual(
			'ok'
		);

		const docSnap = await db.collection('listings').doc(mockListing.id).get();

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { updatedAt, createdAt, ...listing } = docSnap.data() as ListingData;
		expect(listing).toEqual(mockListing);
		mockFetchUser.mockReturnValue(mockListing.seller);
		expect(wrapped(mockListing, { auth: mockListing.seller })).resolves.toEqual(
			'ok'
		);
	});

	it('empty id', () => {
		mockListing['id'] = '';
		mockFetchUser.mockReturnValue(mockListing.seller);
		expect(wrapped(mockListing, { auth: mockListing.seller })).rejects.toEqual(
			new Error('Fail to create new listing')
		);
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
