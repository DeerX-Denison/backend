import * as admin from 'firebase-admin';
import { Validator } from '../../utils/validator';
import { Json } from '../json';

export class UserMultiFactorSettings implements IUserMultiFactorSettings {
	enrolledFactors: UserMultiFactorInfo[];

	/**
	 * create new UserMultiFactorSettings
	 * @param field for debug purposes
	 * @param data unknown data to be parsed
	 */
	constructor(field: string, data: unknown) {
		const json = Validator.json(field, data);

		// 1. validate enrolledFactors
		Validator.hasKey(`${field}.enrolledFactors`, json, 'enrolledFactors');
		this.enrolledFactors = Validator.isArray(
			`${field}.enrolledFactors`,
			json.enrolledFactors
		).map(
			(rawEnrolledFactors) =>
				new UserMultiFactorInfo(
					`${field}.enrollmentFactors`,
					rawEnrolledFactors
				)
		);
	}

	toJSON(): Json {
		return { enrolledFactors: this.enrolledFactors.map((x) => x.toJSON()) };
	}
}

export type IUserMultiFactorSettings = {
	enrolledFactors: UserMultiFactorInfo[];
	toJSON(): Json;
};

export class UserMultiFactorInfo implements IUserMultiFactorInfo {
	uid: string;
	displayName?: string;
	enrollmentTime?: string;
	factorId: string;
	phoneNumber: string;

	/**
	 * create new UserMultiFactorInfo class
	 * @param field for debug purposes
	 * @param data unknown data to be parsed
	 */
	constructor(field: string, data: unknown) {
		const json = Validator.json(field, data);

		// 1. validate uid
		Validator.hasKey(`${field}.uid`, json, 'uid');
		this.uid = Validator.string(`${field}.uid`, json.uid);

		// 2. validate displayName
		if (json.displayName !== undefined) {
			this.displayName = Validator.string(
				`${field}.displayName`,
				json.displayName
			);
		}

		// 3. validate enrollmentTime
		if (json.enrollmentTime !== undefined) {
			this.enrollmentTime = Validator.string(
				`${field}.enrollmentTime`,
				json.enrollmentTime
			);
		}

		// 4. validate factorId
		Validator.hasKey(`${field}.factorId`, json, 'factorId');
		this.factorId = Validator.string(`${field}.factorId`, json.factorId);

		// 5. validate phoneNumber
		Validator.hasKey(`${field}.phoneNumber`, json, 'phoneNumber');
		this.phoneNumber = Validator.phoneNumber(
			`${field}.phoneNumber`,
			json.phoneNumber
		);
	}

	toJSON(): Json {
		return {
			uid: this.uid,
			displayName: this.displayName,
			enrollmentTime: this.enrollmentTime,
			factorId: this.factorId,
			phoneNumber: this.phoneNumber,
		};
	}
}

export interface IUserMultiFactorInfo
	extends Omit<admin.auth.PhoneMultiFactorInfo, 'initFromServerResponse'> {
	toJSON(): Json;
}
