import * as admin from 'firebase-admin';
import { Validator } from '../utils/validator';
import { ValidationError } from './errors/validation-error';
import { Json } from './json';
export class Timestamp extends admin.firestore.Timestamp implements ITimestamp {
	/**
	 * @param field for debug purposes
	 * @param input unknown data to be parsed
	 */
	constructor(field: string, input: unknown) {
		if (input instanceof Date) {
			const millis = Date.parse(input.toUTCString());
			if (millis <= -62135596800000 || millis >= 253402300799000) {
				throw new ValidationError(
					field,
					'Value for argument "seconds" must be within [-62135596800, 253402300799] inclusive',
					millis.toString()
				);
			}
			super(Math.floor(millis / 1000), millis % 1000);
		} else {
			const json = Validator.json(field, input);

			let secondKey: 'seconds' | '_seconds';
			let nanosecondsKey: 'nanoseconds' | '_nanoseconds';

			try {
				Validator.hasKey(field, json, 'seconds');
				secondKey = 'seconds';
			} catch (error) {
				Validator.hasKey(field, json, '_seconds');
				secondKey = '_seconds';
			}

			try {
				Validator.hasKey(field, json, 'nanoseconds');
				nanosecondsKey = 'nanoseconds';
			} catch (error) {
				Validator.hasKey(field, json, '_nanoseconds');
				nanosecondsKey = '_nanoseconds';
			}

			super(
				Validator.number(`timestamp.${secondKey}`, json[secondKey]),
				Validator.number(`timestamp.${nanosecondsKey}`, json[nanosecondsKey])
			);
		}
	}

	toJSON(): Json {
		return {
			seconds: this.seconds,
			nanoseconds: this.nanoseconds,
		};
	}
}

export interface ITimestamp {
	toJSON(): Json;
}
