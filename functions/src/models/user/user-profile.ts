import { Validator } from '../../utils/validator';
import { Json } from '../json';

export class UserProfile implements IUserProfile {
	uid: string;
	email?: string | null;
	photoURL?: string | null;
	displayName?: string | null;

	/**
	 * @param field for debug purposes
	 * @param data unknown data to be parsed
	 */
	constructor(field: string, data: unknown) {
		const json = Validator.json(field, data);

		// valdiate uid
		Validator.hasKey(`${field}.uid`, json, 'uid');
		this.uid = Validator.string(`${field}.uid`, json.uid);

		// valdiate email
		if (json.email !== undefined && json.email !== '') {
			this.email = Validator.email(`${field}.email`, json.email);
		} else if (json.email === null) {
			this.email = null;
		}

		// valdiate photoURL
		if (json.photoURL !== undefined && json.photoURL !== '') {
			this.photoURL = Validator.photoURL(`${field}.photoURL`, json.photoURL);
		} else if (json.photoURL === null) {
			this.photoURL = null;
		}

		// valdiate displayName
		if (json.displayName !== undefined && json.displayName !== '') {
			this.displayName = Validator.string(
				`${field}.displayName`,
				json.displayName
			);
		} else if (json.displayName === null) {
			this.displayName = null;
		}
	}

	toJSON(): Json {
		return {
			uid: this.uid,
			email: this.email,
			photoURL: this.photoURL,
			displayName: this.displayName,
		};
	}
}

export interface IUserProfile {
	uid: string;
	email?: string | null;
	photoURL?: string | null;
	displayName?: string | null;
	toJSON(): Json;
}
