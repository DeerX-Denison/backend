import { Validator } from '../../utils/validator';

export class Email extends String {
	constructor(field: string, input: unknown) {
		Validator.string(field, input);
		super(input);
	}
}
