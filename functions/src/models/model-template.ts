import { Json } from './json';

export class Model implements IModel {
	/**
	 * @param field for debug purposes
	 * @param data unknown data to be parsed
	 */
	constructor(field: string, data: unknown) {
		// const json = Validator.json(field, data);
	}

	toJSON(): Json {
		return {};
	}
}

export interface IModel {
	toJSON(): Json;
}
