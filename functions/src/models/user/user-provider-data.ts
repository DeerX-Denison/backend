import * as admin from 'firebase-admin';
import { Validator } from '../../utils/validator';
import { Json } from '../json';

export class UserProviderData implements IUserProviderData {
	uid?: string;
	displayName?: string;
	email?: string;
	phoneNumber?: string;
	photoURL?: string;
	providerId: string;

	constructor(field: string, data: unknown) {
		const json = Validator.json(field, data);

		// 1. validate uid
		if (json.uid !== undefined) {
			this.uid = Validator.string(`${field}.uid`, json.uid);
		}

		// 2. validate displayName
		if (json.displayName !== undefined) {
			this.displayName = Validator.string(
				`${field}.displayName`,
				json.displayName
			);
		}

		// 3. validate email
		if (json.email !== undefined) {
			this.email = Validator.string(`${field}.email`, json.email);
		}

		// 4. validate phoneNumber
		if (json.phoneNumber !== undefined) {
			this.phoneNumber = Validator.string(
				`${field}.phoneNumber`,
				json.phoneNumber
			);
		}

		// 5. validate photoURL
		if (json.photoURL !== undefined) {
			this.photoURL = Validator.string(`${field}.photoURL`, json.photoURL);
		}

		// 6. validate providerId
		Validator.hasKey(`${field}.providerId`, json, 'providerId');
		this.providerId = Validator.string(`${field}.providerId`, json.providerId);
	}

	toJSON(): Json {
		return {
			uid: this.uid,
			displayName: this.displayName,
			email: this.email,
			phoneNumber: this.phoneNumber,
			photoURL: this.photoURL,
			providerId: this.providerId,
		};
	}
}

export interface IUserProviderData
	extends Omit<
		admin.auth.UserInfo,
		'displayName' | 'email' | 'phoneNumber' | 'photoURL' | 'uid'
	> {
	uid?: string;
	displayName?: string;
	email?: string;
	phoneNumber?: string;
	photoURL?: string;
}
