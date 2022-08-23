import { Json } from '../../../models/json';
import { Validator } from '../../../utils/validator';

export class CreateListingRequest implements ICreateListingRequest {
	/**
	 * @param field for debug purposes
	 * @param data unknown data to be parsed
	 */
	constructor(field: string, data: unknown) {
		const json = Validator.json(field, data);
	}

	toJSON(): Json {
		return {};
	}
}

export interface ICreateListingRequest {
	toJSON(): Json;
}
