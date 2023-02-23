import 'ts-jest';
// import { testEnv } from './firebase.config';
// import { WrappedFunction } from 'firebase-functions-test/lib/main';
// import * as myFunctions from '.';

describe('hello world callable', () => {
	// let createTestUser: WrappedFunction;
	// beforeAll(() => {
	// 	createTestUser = testEnv.wrap(myFunctions.createTestUser);
	// });
	test('It creates new test user', async () => {
		// const res = await createTestUser({email: })
	});
	test('it returns "Hello from Callable Firebase!"', async () => {
		// const res = await wrapped({}, { auth: { uid: 'foobar' } });
		// expect(res).toBe('error');
	});
});

describe('hello world request', () => {
	// test('it returns "Hello from Request Firebase!', () => {
	// 	const req = {};
	// 	const res = {
	// 		send: (payload: any) => {
	// 			expect(payload).toBe('Hello from Request Firebase!');
	// 		},
	// 	};
	// 	myFunctions.helloWorldRequest(req as any, res as any);
	// });
});
