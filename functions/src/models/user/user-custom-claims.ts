import { Validator } from '../../utils/validator';
import { Json } from '../json';
import { UserProfileStatus } from './user-profile-status';
import { UserRole } from './user-role';

export class UserCustomClaims implements IUserCustomClaims {
	role?: UserRole;
	appAccess?: string[];
	profileStatus?: UserProfileStatus;

	/**
	 * create new UserCustomClaims instance
	 * @param field for debug purposes
	 * @param data unknown data to be validated
	 */
	constructor(field: string, data: unknown) {
		const json = Validator.json(field, data);

		// 1. validate role
		if (json.role !== undefined && json.role !== null && json.role !== '') {
			this.role = Validator.stringEnum(
				`${field}.role`,
				UserRole,
				json.role
			) as UserRole;
		}

		// 2. validate appAccess
		if (
			json.appAccess !== undefined &&
			json.appAccess !== null &&
			json.appAccess !== ''
		) {
			this.appAccess = Validator.isArray(
				`${field}.appAccess`,
				json.appAccess
			).map((rawAppAccess, index) =>
				Validator.string(`${field}.appAccess[${index}]`, rawAppAccess)
			);
		}

		// 3. validate profileStatus
		if (
			json.profileStatus !== undefined &&
			json.profileStatus !== null &&
			json.profileStatus !== ''
		) {
			this.profileStatus = Validator.stringEnum(
				`${field}.profileStatus`,
				UserProfileStatus,
				json.profileStatus
			) as UserProfileStatus;
		}
	}

	toJSON(): Json {
		return {
			role: this.role,
			appAccess: this.appAccess,
			profileStatus: this.profileStatus,
		};
	}
}

export interface IUserCustomClaims {
	role?: UserRole;
	profileStatus?: UserProfileStatus;
	toJSON(): Json;
}
