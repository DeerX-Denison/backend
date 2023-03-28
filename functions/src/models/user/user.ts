import { z } from 'zod';
import { PhoneNumber } from '../phone-number';
import { NonEmptyString } from '../non-empty-string';
import { CallableContext, Firebase, UserRecord } from '../../services/firebase';
import { AuthError } from '../error/auth-error';
import { UserMetadataSchema } from './user-metadata';
import { UserMultiFactorSettingsSchema } from './user-multi-factor-settings';
import { UserRole } from './user-role';
import { UserProfileStatus } from './user-profile-status';
import { Collection } from '../collection-name';
import { NotFoundError } from '../error/not-found-error';
import { Listing, ListingData } from '../listing/listing';
import { MessageData } from '../message/message';
import { UserProviderDataSchema } from './user-provider-data';
import userNameAndPhoto from '../../user/users.json';
import { Config } from '../../config';
import { ThreadData } from '../thread/thread';
import { ModelOptions } from '../model-options';
import { Utils } from '../../utils/utils';
import userData from '../../user/users.json';
import { UserProfileSchema } from './user-profile';
import { Wishlist, WishlistData } from '../wishlist/wishlist';

export const UserSchema = UserProfileSchema.extend({
	emailVerified: z.boolean(),
	phoneNumber: PhoneNumber.optional().nullable(),
	disabled: z.boolean(),
	metadata: UserMetadataSchema,
	providerData: z.array(UserProviderDataSchema),
	passwordHash: NonEmptyString.optional(),
	passwordSalt: NonEmptyString.optional(),
	tokensValidAfterTime: NonEmptyString.optional().nullable(),
	tenantId: NonEmptyString.optional().nullable(),
	multiFactor: UserMultiFactorSettingsSchema.optional(),
	role: z.nativeEnum(UserRole).optional(),
	profileStatus: z.nativeEnum(UserProfileStatus).optional(),
	followersId: z.array(NonEmptyString).optional(),
	followingId: z.array(NonEmptyString).optional(),
});

export type UserData = z.infer<typeof UserSchema>;

export class User {
	/**
	 * authorize invoker to have authenticated
	 * @param context invoke context to authorize
	 * @returns id of invoker
	 */
	public static isLoggedIn(context: CallableContext): string {
		if (!context.auth) throw new AuthError();
		return context.auth.uid;
	}

	/**
	 * authorize if user is not banned
	 * @param user user data to authorize
	 * @returns true if user is not banned, false otherwise
	 */
	public static isNotBanned(user: UserData): boolean {
		if (user.disabled) throw new AuthError();
		return user.disabled;
	}

	/**
	 * validate valid email address
	 */
	public static validEmail(authData: CallableContext['auth'] | undefined) {
		if (!authData) throw new AuthError();
		const email = authData.token.email;
		if (!email) throw new AuthError();
		if (!authData.token.email_verified) throw new AuthError();
		if (email.endsWith(Config.emailPrefix)) return email;
		if (Config.testerEmails.includes(email)) return email;
		console.log(Config.testerEmails);
		throw new AuthError();
	}

	/**
	 * get user's community id
	 * @param email input user email to parse community id
	 * @returns user's community id
	 */
	public static getCommunityId(email: string): string {
		return email.split('@')[0];
	}

	/**
	 * check if input user is seller of input listing
	 * @param user input user to check is seller
	 * @param listing input listing to check for is seller
	 * @returns true if user is seller of listing, false otherwise
	 */
	public static isSeller(user: UserData, listing: ListingData): boolean {
		if (user.uid !== listing.seller.uid) throw new AuthError();
		return true;
	}

	/**
	 * check if input user is member of input thread
	 * @param user input user to check is member of thread
	 * @param thread input thread to check for is member
	 */
	public static isThreadMember(user: UserData, thread: ThreadData) {
		if (!thread.membersUid.includes(user.uid)) throw new AuthError();
		return true;
	}

	/**
	 * check if input user is reader of input message
	 * @param user input user to check is member of thread
	 * @param message input message to check for is member
	 */
	public static isMessageReader(user: UserData, message: MessageData) {
		if (!message.membersUid.includes(user.uid)) throw new AuthError();
		return true;
	}

	/**
	 * get default photo url of input user email
	 * @param email input email to get default photo url
	 * @returns photoURL of input user email
	 */
	public static getDefaultPhotoURL(email: string) {
		let photoURL: string;
		if (
			email &&
			email in userNameAndPhoto &&
			'img' in (userNameAndPhoto as any)[email]
		) {
			photoURL = (userNameAndPhoto as any)[email].img;
		} else {
			photoURL = Config.defaultUserPhotoURL;
		}
		return photoURL;
	}

	/**
	 * add a wishlist to a particular user
	 * @param uid uid of user to add input wishlist to
	 * @param wishlist input wishlist to add to
	 * @returns A promise that resolves if wishlist is added to input user
	 */
	public static async addWishlist(
		uid: string,
		wishlist: WishlistData
	): Promise<void> {
		const batch = Firebase.db.batch();
		await Wishlist.create(uid, wishlist, { batch });
		await Listing.update(
			wishlist.id,
			{ likedBy: Firebase.arrayUnion(uid) },
			{ batch }
		);
		await batch.commit();
	}

	/**
	 * remove a wishlist to a particular user
	 * @param uid uid of user to add input wishlist to
	 * @param wishlistId input wishlist id to remove to
	 * @returns A promise that resolves if wishlist is removed from input user
	 */
	public static async removeWishlist(
		uid: string,
		wishlistId: string
	): Promise<void> {
		const batch = Firebase.db.batch();
		await Wishlist.delete(uid, wishlistId, { batch });
		await Listing.update(
			wishlistId,
			{ likedBy: Firebase.arrayRemove(uid) },
			{ batch }
		);
		await batch.commit();
	}

	/**
	 * sync user data from firebase auth to firestore
	 * @param email input user email to sync user data
	 */
	public static async sync(uid: string, email: string): Promise<void> {
		const communityId = this.getCommunityId(email);
		const searchableKeyword = Utils.getAllSubstrings(communityId);
		const displayName =
			email in userData
				? (userData as any)[email].name
				: Config.defaultUserDisplayName;
		const photoURL =
			email in userData
				? (userData as any)[email].img
				: Config.defaultUserPhotoURL;
		const updatedUser = UserProfileSchema.extend({
			searchableKeyword: z.array(NonEmptyString),
		}).parse({ uid, email, displayName, photoURL, searchableKeyword });
		await Firebase.db.collection(Collection.users).doc(uid).set(updatedUser);
		await Firebase.auth.updateUser(uid, {
			...updatedUser,
			email: updatedUser.email ? updatedUser.email : undefined,
		});
	}

	public static parse(data: unknown): UserData {
		return UserSchema.parse(data);
	}

	/**
	 * get a user from database
	 * @param uid id of target user to fetch
	 * @param opts get options
	 * @returns user data from database
	 */
	public static async get(
		uid: string,
		opts: ModelOptions = {}
	): Promise<UserData> {
		const authUser = await Firebase.auth.getUser(uid);
		const documentReference = Firebase.db.collection(Collection.users).doc(uid);
		const documentSnapshot = opts.transaction
			? await opts.transaction.get(documentReference)
			: await documentReference.get();
		if (!documentSnapshot.exists || documentSnapshot.data() === undefined)
			throw new NotFoundError(new Error('User not exist'));
		return this.parse({ ...authUser, ...documentSnapshot.data() });
	}

	/**
	 * create user from input email and password to firebase auth database
	 * note that this will not create user in firestore database
	 * use this.sync() to sync user data between firestore and firebase auth
	 * @param email email of user
	 * @param password password of user
	 */
	public static async create(
		email: string,
		password: string
	): Promise<UserRecord> {
		return await Firebase.auth.createUser({
			email,
			password,
			emailVerified: true,
		});
	}

	/**
	 * update a user with input uid and input data
	 * @param uid uid of user to update
	 * @param data new user data to update
	 * @param opts update options
	 * @returns void
	 */
	public static async update(
		uid: string,
		data: Partial<Omit<UserData, 'id'>>,
		opts: ModelOptions = {}
	): Promise<void> {
		await Firebase.auth.updateUser(uid, { photoURL: data.photoURL });
		const documentReference = Firebase.db.collection(Collection.users).doc(uid);
		if (opts.batch) {
			opts.batch.update(documentReference, data);
			return;
		}
		if (opts.transaction) {
			opts.transaction.update(documentReference, data);
			return;
		}
		await documentReference.update(data);
		return;
	}

	/**
	 * delete a user from entire system
	 * @param uid id of user to delete
	 */
	public static async delete(uid: string): Promise<void> {
		await Firebase.auth.deleteUser(uid);
		const documentReference = Firebase.db.collection(Collection.users).doc(uid);
		await Firebase.db.recursiveDelete(documentReference);
	}
}
