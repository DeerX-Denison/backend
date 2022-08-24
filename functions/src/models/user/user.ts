import { Validator } from '../../utils/validator';
import { Json } from '../json';
import { UserCustomClaims } from './user-custom-claims';
import { UserMetadata } from './user-metadata';
import { UserMultiFactorSettings } from './user-multifactor-settings';
import { IUserProfile, UserProfile } from './user-profile';
import { UserProfileStatus } from './user-profile-status';
import { UserProviderData } from './user-provider-data';
import { UserRole } from './user-role';

export class User extends UserProfile implements IUser {
	emailVerified: boolean;
	phoneNumber?: string;
	disabled: boolean;
	metadata: UserMetadata;
	providerData: UserProviderData[];
	passwordHash?: string;
	passwordSalt?: string;
	tokensValidAfterTime?: string;
	tenantId?: string | null;
	multiFactor?: UserMultiFactorSettings;
	role?: UserRole;
	profileStatus?: UserProfileStatus;
	followersId?: string[];
	followingId?: string[];

	/**
	 * @param field for debug purposes
	 * @param data unknown data to be parsed
	 */
	constructor(field: string, data: unknown) {
		const json = Validator.json(field, data);

		super(field, json);

		// validate emailVerified
		Validator.hasKey(`${field}.emailVerified`, json, 'emailVerified');
		this.emailVerified = Validator.boolean(
			`${field}.boolean`,
			json.emailVerified
		);

		// 5. validate phoneNumer
		if (json.phoneNumber !== undefined && json.phoneNumber !== null) {
			this.phoneNumber = Validator.phoneNumber(
				`${field}.phoneNumber`,
				json.phoneNumber
			);
		}

		// validate disabled
		Validator.hasKey(`${field}.disabled`, json, 'disabled');
		this.disabled = Validator.boolean(`${field}.disabled`, json.disabled);

		// validate metadata
		Validator.hasKey(`${field}.metadata`, json, 'metadata');
		this.metadata = new UserMetadata(`${field}.metadata`, json.metadata);

		// validate providerData
		Validator.hasKey(`${field}.providerData`, json, 'providerData');
		this.providerData = Validator.isArray(
			`${field}.providerData`,
			json.providerData
		).map(
			(rawProviderData, index) =>
				new UserProviderData(
					`${field}.providerData.providerData[${index}]`,
					rawProviderData
				)
		);

		// validate passwordHash
		if (json.passwordHash !== undefined && json.passwordHash !== null) {
			this.passwordHash = Validator.string(
				`${field}.passwordHash`,
				json.passwordHash
			);
		}

		// validate passwordSalt
		if (json.passwordSalt !== undefined && json.passwordSalt !== null) {
			this.passwordSalt = Validator.string(
				`${field}.passwordSalt`,
				json.passwordSalt
			);
		}

		// validate tokensValidAfterTime
		if (
			json.tokensValidAfterTime !== undefined &&
			json.tokensValidAfterTime !== null
		) {
			this.tokensValidAfterTime = Validator.string(
				`${field}.tokensValidAfterTime`,
				json.tokensValidAfterTime
			);
		}

		// validate tenantId
		if (json.tenantId !== undefined) {
			if (json.tenantId === null) {
				this.tenantId = null;
			} else {
				this.tenantId = Validator.string(`${field}.tenantId`, json.tenantId);
			}
		}

		// validate multiFactor
		if (json.multiFactor !== undefined) {
			Validator.json(`${field}.multiFactor`, json.multiFactor);
			this.multiFactor = new UserMultiFactorSettings(
				`${field}.multiFactor`,
				json.multiFactor
			);
		}

		// validate customClaims
		let customClaims: UserCustomClaims;
		if (json.customClaims !== undefined) {
			customClaims = new UserCustomClaims(
				`${field}.customClaims`,
				json.customClaims
			);
			this.role = customClaims.role;
			this.profileStatus = customClaims.profileStatus;
		}

		// validate followersId
		Validator.hasKey(`${field}.followersid`, json, 'followersId');
		this.followersId = Validator.isArray(
			`${field}.followersId`,
			json.followersId
		).map((rawFollowerId, index) =>
			Validator.string(`${field}.followersId[${index}]`, rawFollowerId)
		);

		// validate followingId
		Validator.hasKey(`${field}.followingId`, json, 'followingId');
		this.followingId = Validator.isArray(
			`${field}.followingId`,
			json.followingId
		).map((rawFollowingId, index) =>
			Validator.string(`${field}.followingId[${index}]`, rawFollowingId)
		);
	}

	toJSON(): Json {
		return {
			uid: this.uid,
			email: this.email,
			emailVerified: this.emailVerified,
			displayName: this.displayName,
			phoneNumber: this.phoneNumber,
			photoURL: this.photoURL,
			disabled: this.disabled,
			metadata: this.metadata.toJSON(),
			providerData: this.providerData.map((x) => x.toJSON()),
			passwordHash: this.passwordHash,
			passwordSalt: this.passwordSalt,
			tokensValidAfterTime: this.tokensValidAfterTime,
			tenantId: this.tenantId,
			multiFactor: this.multiFactor?.toJSON(),
			role: this.role,
			profileStatus: this.profileStatus,
			followersId: this.followersId,
			followingId: this.followingId,
		};
	}
}

export interface IUser extends IUserProfile {
	toJSON(): Json;
}
