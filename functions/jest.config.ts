module.exports = {
	preset: 'ts-jest',
	testRegex: '((\\.|/)(test|spec))\\.[jt]sx?$',
	testEnvironment: 'node',
	rootDir: 'src',
	setupFiles: ['./setupTest.ts'],
};
