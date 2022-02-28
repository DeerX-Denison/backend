import 'ts-jest';

// overwrite Logger's methods to do nothing. This will suppress logger when testing
jest.mock('./Logger', () =>
	jest.fn().mockImplementation(() => ({
		error: jest.fn(),
		log: jest.fn(),
		warn: jest.fn(),
		info: jest.fn(),
	}))
);
