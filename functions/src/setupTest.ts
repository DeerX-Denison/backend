import 'ts-jest';

// mock fetchUser to return the following mock user info
jest.mock('./utils/fetchUser', () => jest.fn().mockReturnValue(mockUserInfo));
export const mockUserInfo = {
	email: 'mock email',
	displayName: 'mock display name',
	photoURL: 'mock photo url',
	uid: 'mock uid',
};

// mock environment variables
process.env.FIREBASE_CONFIG = 'mock firebase config';
process.env.GCLOUD_PROJECT = 'mock gcloud project config';
