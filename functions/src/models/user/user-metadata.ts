import * as admin from 'firebase-admin';
import { Validator } from '../../utils/validator';
import { Json } from '../json';

export class UserMetadata implements IUserMetadata {
	lastSignInTime?: string | null;
	creationTime?: string | null;
	lastRefreshTime?: string | null;

	/**
	 * create a new user metadata class
	 * @param field for debug purposes
	 * @param value unknown value to be parsed to be user metadata
	 */
	constructor(field: string, value: unknown) {
		const json = Validator.json(field, value);

		// 1. validate lastSignInTime
		if (json.lastSignInTime !== undefined) {
			if (json.lastSignInTime === null) {
				this.lastSignInTime = null;
			} else {
				this.lastSignInTime = Validator.string(
					`${field}.lastSignInTime`,
					json.lastSignInTime
				);
			}
		}

		// 2. validate creationTime
		if (json.creationTime !== undefined) {
			if (json.creationTime === null) {
				this.creationTime = null;
			} else {
				this.creationTime = Validator.string(
					`${field}.creationTime`,
					json.creationTime
				);
			}
		}

		// 3. validate lastRefreshTime
		if (json.lastRefreshTime !== undefined) {
			if (json.lastRefreshTime === null) {
				this.lastRefreshTime = null;
			} else {
				this.lastRefreshTime = Validator.string(
					`${field}.lastRefreshTime`,
					json.lastRefreshTime
				);
			}
		}
	}

	toJSON(): Json {
		return {
			lastSignInTime: this.lastSignInTime,
			creationTime: this.creationTime,
			lastRefreshTime: this.lastRefreshTime,
		};
	}
}

export interface IUserMetadata
	extends Omit<admin.auth.UserMetadata, 'lastSignInTime' | 'creationTime'> {
	lastSignInTime?: string | null;
	creationTime?: string | null;
}
