export type JsonValue =
	| string
	| number
	| boolean
	| null
	| Json
	| JsonArray
	| Date;

export type JsonArray = Array<JsonValue>;

export type Json = {
	[key in string]?: JsonValue;
};
