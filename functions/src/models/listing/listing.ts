import { Validator } from '../../utils/validator';
import { Json } from '../json';
import { Timestamp } from '../timestamp';
import { UserProfile } from '../user/user-profile';
import { ListingCategory } from './listing-category';
import { ListingCondition } from './listing-condition';
import { ListingStatus } from './listing-status';

export class Listing implements IListing {
	id: string;
	images: string[];
	name: string;
	price: string;
	category: ListingCategory[];
	seller: UserProfile;
	condition: ListingCondition;
	description: string;
	savedBy: number;
	readonly createdAt: Timestamp;
	readonly updatedAt: Timestamp;
	status: ListingStatus;

	/**
	 * @param field for debug purposes
	 * @param data unknown data to be parsed
	 */
	constructor(field: string, data: unknown) {
		const json = Validator.json(field, data);

		// validate id
		Validator.hasKey(`${field}.id`, json, 'id');
		this.id = Validator.string(`${field}.id`, json.id);

		// validate images
		Validator.hasKey(`${field}.images`, json, 'images');
		this.images = Validator.isArray(`${field}.imagex`, json.images).map(
			(x, i) => Validator.string(`${field}.images[${i}]`, x)
		);

		// validate name
		Validator.hasKey(`${field}.name`, json, 'name');
		this.name = Validator.string(`${field}.name`, json.name);

		// validate price
		Validator.hasKey(`${field}.price`, json, 'price');
		this.price = Validator.string(`${field}.price`, json.price);

		// validate category
		Validator.hasKey(`${field}.category`, json, 'category');
		this.category = Validator.isArray(`${field}.category`, json.category).map(
			(x, i) =>
				Validator.stringEnum(
					`${field}.category[${i}]`,
					ListingCategory,
					x
				) as ListingCategory
		);

		// validate seller
		Validator.hasKey(`${field}.seller`, json, 'seller');
		this.seller = new UserProfile(`${field}.seller`, json.seller);

		// validate condition
		Validator.hasKey(`${field}.condition`, json, 'condition');
		this.condition = Validator.stringEnum(
			`${field}.condition`,
			ListingCondition,
			json.condition
		) as ListingCondition;

		// validate description
		Validator.hasKey(`${field}.description`, json, 'description');
		this.description = Validator.string(
			`${field}.description`,
			json.description
		);

		// validate savedBy
		Validator.hasKey(`${field}.savedBy`, json, 'savedBy');
		this.savedBy = Validator.number(`${field}.savedBy`, json.savedBy);

		// validate readonly createdAt
		Validator.hasKey(`${field}.createdAt`, json, 'createdAt');
		this.createdAt = new Timestamp(`${field}.createdAt`, json.createdAt);

		// validate readonly updatedAt
		Validator.hasKey(`${field}.updatedAt`, json, 'updatedAt');
		this.updatedAt = new Timestamp(`${field}.updatedAt`, json.updatedAt);

		// validate status
		Validator.hasKey(`${field}.status`, json, 'status');
		this.status = Validator.stringEnum(
			`${field}.status`,
			ListingStatus,
			json.status
		) as ListingStatus;
	}

	toJSON(): Json {
		return {
			id: this.id,
			images: this.images,
			name: this.name,
			price: this.price,
			category: this.category,
			seller: this.seller.toJSON(),
			condition: this.condition,
			description: this.description,
			savedBy: this.savedBy,
			createdAt: this.createdAt.toJSON(),
			updatedAt: this.updatedAt.toJSON(),
			status: this.status,
		};
	}
}

export interface IListing {
	id: string;
	images: string[];
	name: string;
	price: string;
	category: ListingCategory[];
	seller: UserProfile;
	condition: ListingCondition;
	description: string;
	savedBy: number;
	readonly createdAt: Timestamp;
	readonly updatedAt: Timestamp;
	status: ListingStatus;
	toJSON(): Json;
}
