import { Timestamp } from './timestamp';

export type JsonValue =
	| string
	| number
	| boolean
	| null
	| Json
	| JsonArray
	| Timestamp
	| Date;

export type JsonArray = Array<JsonValue>;

export type Json = {
	[key in string]?: JsonValue;
};
