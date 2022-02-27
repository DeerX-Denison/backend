interface ILogger {
	log: (x: unknown) => void;
	error: (x: unknown) => void;
	debug: (x: unknown) => void;
	warn: (x: unknown) => void;
}
class Logger implements ILogger {
	log(x: unknown) {
		console.log(x);
	}
	error(x: unknown) {
		console.error(x);
	}
	debug(x: unknown) {
		console.debug(x);
	}
	warn(x: unknown) {
		console.warn(x);
	}
}

const logger = new Logger();

export default logger;
