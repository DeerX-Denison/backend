import { Listing } from '../../listing/listing';

export class CreateListingRequest extends Listing {
	/**
	 * @param field for debug purposes
	 * @param data unknown data to be parsed
	 */
	constructor(field: string, data: unknown) {
		super(field, data);
	}
}
