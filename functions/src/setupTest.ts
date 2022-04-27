import 'ts-jest';

// mock fetchUserInfo to return the following mock user info
jest.mock('./utils/fetchUserInfo', () =>
	jest.fn().mockReturnValue(mockUserInfo)
);

// mock fetchUserProfile to return the following mock user profile
jest.mock('./utils/fetchUserProfile', () =>
	jest.fn().mockReturnValue(mockUserProfile)
);

export const mockUserInfo = {
	email: 'mock email',
	displayName: 'mock display name',
	photoURL: 'mock photo url',
	uid: 'mock uid',
	disabled: false,
};

export const mockUserProfile = {
	...mockUserInfo,
	pronouns: ['HIM', 'HE'],
	bio: 'Test bio',
};

// mock environment variables
process.env.FIREBASE_CONFIG = 'mock firebase config';
process.env.GCLOUD_PROJECT = 'mock gcloud project config';
