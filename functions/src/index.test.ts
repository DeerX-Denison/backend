import 'ts-jest';
// import { testEnv } from './firebase.config';
// import { WrappedFunction } from 'firebase-functions-test/lib/main';
// import * as myFunctions from '.';

describe('hello world callable', () => {
	// let wrapped: WrappedFunction;
	beforeAll(() => {
		// wrapped = testEnv.wrap(myFunctions.helloWorldCallable);
	});
	test('it returns "Hello from Callable Firebase!"', async () => {
		// const res = await wrapped({});
		// expect(res).toBe('Hello from Callable Firebase!');
	});
});

describe('hello world request', () => {
	test('it returns "Hello from Request Firebase!', () => {
		// const req = {};
		// const res = {
		// 	send: (payload: any) => {
		// 		expect(payload).toBe('Hello from Request Firebase!');
		// 	},
		// };
		// myFunctions.helloWorldRequest(req as any, res as any);
	});
});
