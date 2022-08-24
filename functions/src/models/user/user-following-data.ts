import { Validator } from '../../utils/validator';
import { Json } from '../json';

export class UserFollowingData implements IUserFollowingData {
	uid: string;

	/**
	 * @param field for debug purposes
	 * @param value unknown value to be parsed to be user metadata
	 */
	constructor(field: string, value: unknown) {
		const json = Validator.json(field, value);

		// 1. validate uid
		Validator.hasKey(`${field}.uid`, json, 'uid');
		this.uid = Validator.string(`${field}.uid`, json.uid);
	}

	toJSON(): Json {
		return {
			uid: this.uid,
		};
	}
}

export interface IUserFollowingData {
	uid: string;
}
