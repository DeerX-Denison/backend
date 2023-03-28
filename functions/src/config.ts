import dotenv from 'dotenv';
import secrets from './secrets.json';

dotenv.config();

export class Config {
	/**
	 * Email domain of the community
	 * Any email that does not end with this prefix is considered invalid
	 * Defaults to "@denison.edu"
	 */
	public static emailPrefix = process.env.EMAIL_PREFIX ?? '@denison.edu';

	/**
	 * List of tester email
	 * Tester email bypasses email prefix checks
	 * Defaults to []
	 */
	public static testerEmails = process.env.TESTERS_EMAIL
		? process.env.TESTERS_EMAIL.split(',').map((_) => _.trim())
		: [];

	/**
	 * List of cloud function regions to deploy
	 * Defaults to ["us-central1"]
	 */
	public static regions = process.env.CLOUD_FUNCTIONS_REGIONS
		? process.env.CLOUD_FUNCTIONS_REGIONS.split(',').map((_) => _.trim())
		: ['us-central1'];

	/**
	 * Secret token to authenticate createTestUser function for testing purposes
	 * If left undefined, triggering createTestUser will result in AuthError
	 */
	public static createTestUserToken = process.env.CREATE_TEST_USER_TOKEN;

	/**
	 * URL to replace images that the system deems invalid with
	 * Defaults to "https://i.ibb.co/M66vK2N/deerx-invalid-image-content.jpg"
	 */
	public static invalidImageContentUrl =
		process.env.INVALID_IMAGE_CONTENT_IMAGE_URL ??
		'https://i.ibb.co/M66vK2N/deerx-invalid-image-content.jpg';

	/**
	 * Default storage bucket name
	 */
	public static storageBucket = secrets.storageBucket;

	/**
	 * Height of listing image to resize image to
	 * Defaults to 720
	 */
	public static listingImageHeight = process.env.LISTING_IMAGE_HEIGHT
		? parseInt(process.env.LISTING_IMAGE_HEIGHT)
		: 720;

	/**
	 * Height of profile image to resize image to
	 * Defaults to 320
	 */
	public static profileImageHeight = process.env.PROFILE_IMAGE_HEIGHT
		? parseInt(process.env.PROFILE_IMAGE_HEIGHT)
		: 320;

	/**
	 * Default photo URL of user when their photo url is nullish
	 */
	public static defaultUserPhotoURL =
		process.env.DEFAULT_USER_PHOTO_URL ??
		'https://i.ibb.co/Y26TN8k/denison-icon-red.jpg';

	/**
	 * List of valid listing image content types
	 */
	public static listingImageValidContentTypes = [
		'image/jpeg',
		'image/png',
		'image/heif',
		'image/heic',
		'application/octet-stream',
	];

	public static defaultMessageName = 'New conversation';

	public static defaultSelfMessageName = 'Message to self';

	public static newRoomMessage = 'New message';

	public static defaultUserDisplayName = 'New user';

	public static emailSender = 'le_w1@denison.edu';

	public static templateSignInEmailId = 'd-7798012883224050a5eb813d9afa4bcb';
}
