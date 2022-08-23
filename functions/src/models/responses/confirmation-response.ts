import { Json } from '../../models/json';

export class ConfirmationResponse implements IConfirmationResponse {
	status: 'ok';

	constructor() {
		this.status = 'ok';
	}

	toJSON(): Json {
		return {
			status: this.status,
		};
	}
}

export interface IConfirmationResponse {
	status: 'ok';
	toJSON(): Json;
}
