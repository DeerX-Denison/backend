import { ValidationError } from '../models/errors/validation-error';
import { Json } from '../models/json';

export class Validator {
	/**
	 * validate if input value has type string
	 * @param field for debug purposes
	 * @param value input value to be validated
	 * @returns boolean
	 */
	public static string(field: string, value: unknown): string {
		if (typeof value !== 'string') {
			throw new ValidationError(field, 'string', typeof value);
		}
		return value;
	}

	/**
	 * validate if input value has type string
	 * @param field for debug purposes
	 * @param value input value to be validated
	 * @returns boolean
	 */
	public static number(field: string, value: unknown): number {
		if (typeof value !== 'number') {
			throw new ValidationError(field, 'number', typeof value);
		}
		return value;
	}

	/**
	 * validate if input json object has input key
	 * @param field for debug purposes
	 * @param object input json object to be validated
	 * @param key input key to be validated
	 * @returns boolean
	 */
	public static hasKey(field: string, object: Json, key: string): void {
		const json = this.json(field, object);
		if (json[key] === undefined) {
			throw new ValidationError(
				field,
				`key '${key}' exist`,
				JSON.stringify(json)
			);
		}
	}

	/**
	 *
	 * @param field for debug purposes
	 * @param input input unknown data to be validated
	 * @returns parsed json object
	 */
	public static json(field: string, input: unknown): Json {
		switch (typeof input) {
			case 'string':
				try {
					return JSON.parse(input);
				} catch (error) {
					throw new ValidationError(field, 'valid json string', input, error);
				}
			case 'object':
				if (input === null)
					throw new ValidationError(field, 'json object', 'null object');
				if (Array.isArray(input))
					throw new ValidationError(field, 'json object', 'array');
				return input;

			default:
				throw new ValidationError(
					field,
					'valid json string or json object',
					`neither: ${typeof input}`
				);
		}
	}

	/**
	 * validate an input array
	 * @param field for debug purposes
	 * @param value input value to be validated
	 */
	public static isArray(field: string, value: unknown): Array<unknown> {
		if (!Array.isArray(value)) {
			throw new ValidationError(
				field,
				'value to be an array',
				JSON.stringify(value)
			);
		}
		return value;
	}

	/**
	 * validate an input string to be in enum
	 * @param field for debug purposes
	 * @param enumType enum to be validated
	 * @param value unknown value to be validated
	 * @returns validated string in input enum
	 */
	public static stringEnum(
		field: string,
		enumType: unknown,
		value: unknown
	): string {
		const stringValue = this.string(field, value);
		const json = Validator.json(field, enumType);
		const possibleValues = Object.values(json);
		if (!possibleValues.includes(stringValue)) {
			throw new ValidationError(
				field,
				`input value in ${JSON.stringify(possibleValues)}`,
				stringValue
			);
		}
		return stringValue;
	}

	/**
	 * validate an input string to be an email
	 * @param field for debug purposes
	 * @param value unknown value to be validated
	 */
	public static email(field: string, value: unknown) {
		const stringValue = this.string(field, value);
		const regexResult = stringValue
			.toLowerCase()
			.match(
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			);
		if (regexResult === null) {
			throw new ValidationError(field, `valid email`, stringValue);
		}
		return stringValue;
	}

	/**
	 * validate an input to be boolean, normalize value if neccessary
	 * for string inputs, check for toLowerCase value to be "true" or "false"
	 * for number inputs, return false for 0
	 * @param field for debug purposes
	 * @param value unknown value to be validated
	 */
	public static boolean(field: string, value: unknown): boolean {
		switch (typeof value) {
			case 'boolean':
				return value;
			case 'number':
				return !(value === 0);
			case 'string':
				switch (value.toLowerCase()) {
					case 'true':
						return true;
					case 'false':
						return false;
					default:
						return false;
				}
			default:
				throw new ValidationError(
					field,
					'typeof input in [boolean, string, number]',
					typeof value
				);
		}
	}
}
