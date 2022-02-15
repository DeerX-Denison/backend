class Logger {
	log(str: unknown) {
		console.log(str);
	}
	error(str: unknown) {
		console.error(str);
	}
	debug(str: unknown) {
		console.debug(str);
	}
	ward(str: unknown) {
		console.warn(str);
	}
}

const logger = new Logger();

export default logger;
