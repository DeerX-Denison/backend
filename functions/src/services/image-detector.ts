import path from 'path';
import os from 'os';
import vision from '@google-cloud/vision';
import { ObjectMetadata } from 'firebase-functions/v1/storage';
import { Logger } from './logger';
import { Config } from '../config';
import { google } from '@google-cloud/vision/build/protos/protos';
import { Firebase } from './firebase';
import { ListingImageMetadata } from '../models/listing';

export class ImageDetector {
	/**
	 * verify if metadata of newly uploaded listing image is valid
	 */
	public static validListingImageMetadata(obj: ObjectMetadata): boolean {
		const { kind, name, metadata, bucket, contentType } = obj;

		// if invalid custom metadata
		if (!metadata) {
			Logger.log('Metadata not found');
			return false;
		}
		if (!metadata.uploader) {
			Logger.log('Metadata uploader not found');
			return false;
		}
		if (!metadata.listingId) {
			Logger.log('Metadata listing id not found');
			return false;
		}
		if (!metadata.imageId) {
			Logger.log('Metadata image id not found');
			return false;
		}
		if (!metadata.resized) {
			Logger.log('Metadata resized status not found');
			return false;
		}
		if (!metadata.contentValidated) {
			Logger.log('Metadata contentValidated status not found');
			return false;
		}

		const { listingId, imageId } = metadata;
		// invalid input obj: functions.storage.ObjectMetadata
		if (kind !== '#storage#object' && kind !== 'storage#object') {
			Logger.log('Invalid kind');
			return false;
		}
		if (name !== `listings/${listingId}/${imageId}`) {
			Logger.log('Invalid name');
			return false;
		}
		if (bucket !== Config.storageBucket) {
			Logger.log('Invalid bucket');
			return false;
		}

		// invalid contentType
		if (!contentType) {
			Logger.log('Content type not found');
			return false;
		}
		const validMIMEtype = [
			'image/jpeg',
			'image/png',
			'image/heif',
			'image/heic',
			'application/octet-stream',
		];

		if (!validMIMEtype.includes(contentType.toLocaleLowerCase())) {
			Logger.log('Invalid content type');
			return false;
		}

		const ext = imageId.substring(imageId.indexOf('.') + 1);

		if (ext === 'jpg' || ext === 'jpeg') {
			if (
				contentType !== 'image/jpeg' &&
				contentType !== 'application/octet-stream'
			) {
				Logger.log('Invalid extension for jpg/jpeg images');
				return false;
			}
		} else if (ext == 'png') {
			if (
				contentType !== 'image/png' &&
				contentType !== 'application/octet-stream'
			) {
				Logger.log('Invalid content type for png images');
				return false;
			}
		} else if (ext === 'heic') {
			if (
				contentType !== 'image/heic' &&
				contentType !== 'application/octet-stream'
			) {
				Logger.log('Invalid content type for heic images');
				return false;
			}
		} else if (ext === 'heif') {
			if (
				contentType !== 'image/heif' &&
				contentType !== 'application/octet-stream'
			) {
				Logger.log('Invalid content type for heif images');
				return false;
			}
		} else {
			Logger.log('Invalid file extension');
			return false;
		}

		return true;
	}

	/**
	 * verify if metadata of newly uploaded profile image is valid
	 */
	public static validProfileImageMetadata: (obj: ObjectMetadata) => boolean = (
		obj
	) => {
		const { kind, name, metadata, bucket, contentType } = obj;

		// if invalid custom metadata
		if (!metadata) {
			Logger.log('Metadata not found');
			return false;
		}

		if (!metadata.resized) {
			Logger.log('Metadata resized status not found');
			return false;
		}
		if (!metadata.contentValidated) {
			Logger.log('Metadata contentValidated status not found');
			return false;
		}

		const { uploaderUid, imgId } = metadata;
		// invalid input obj: functions.storage.ObjectMetadata
		if (kind !== '#storage#object' && kind !== 'storage#object') {
			Logger.log('Invalid kind');
			return false;
		}
		if (name !== `profilePhotos/${uploaderUid}/${imgId}`) {
			Logger.log('Invalid name');
			return false;
		}
		if (bucket !== Config.storageBucket) {
			Logger.log('Invalid bucket');
			return false;
		}

		// invalid contentType
		if (!contentType) {
			Logger.log('Content type not found');
			return false;
		}
		const validMIMEtype = [
			'image/jpeg',
			'image/png',
			'image/heif',
			'image/heic',
			'application/octet-stream',
		];

		if (!validMIMEtype.includes(contentType.toLocaleLowerCase())) {
			Logger.log('Invalid content type');
			return false;
		}

		const ext = imgId.substring(imgId.indexOf('.') + 1);

		if (ext === 'jpg' || ext === 'jpeg') {
			if (
				contentType !== 'image/jpeg' &&
				contentType !== 'application/octet-stream'
			) {
				Logger.log('Invalid extension for jpg/jpeg images');
				return false;
			}
		} else if (ext == 'png') {
			if (
				contentType !== 'image/png' &&
				contentType !== 'application/octet-stream'
			) {
				Logger.log('Invalid content type for png images');
				return false;
			}
		} else if (ext === 'heic') {
			if (
				contentType !== 'image/heic' &&
				contentType !== 'application/octet-stream'
			) {
				Logger.log('Invalid content type for heic images');
				return false;
			}
		} else if (ext === 'heif') {
			if (
				contentType !== 'image/heif' &&
				contentType !== 'application/octet-stream'
			) {
				Logger.log('Invalid content type for heif images');
				return false;
			}
		} else {
			Logger.log('Invalid file extension');
			return false;
		}

		return true;
	};

	/**
	 * initialize google api credential
	 */
	public static initGoogleCredentials = () => {
		const secretPath = path.resolve(__dirname, '..', 'secrets.json');
		process.env['GOOGLE_APPLICATION_CREDENTIALS'] = secretPath;
	};

	/**
	 * validate input detection from google vision api
	 * there are 6 levels of likelihood:
	 * UNKNOWN
	 * VERY_UNLIKELY
	 * UNLIKELY
	 * POSSIBLE
	 * LIKELY
	 * VERY_LIKELY
	 */
	public static validDetection: (
		detections: google.cloud.vision.v1.ISafeSearchAnnotation
	) => boolean = (detections) => {
		let valid = true;
		switch (detections.adult) {
			// case 'LIKELY':
			// 	logger.log('LIKELY ADULT CONTENT');
			// 	valid = false;
			// 	break;
			case 'VERY_LIKELY':
				Logger.log('VERY_LIKELY ADULT CONTENT');
				valid = false;
				break;
			default:
				break;
		}
		switch (detections.spoof) {
			// case 'LIKELY':
			// 	logger.log('LIKELY SPOOF CONTENT');
			// 	valid = false;
			// 	break;
			case 'VERY_LIKELY':
				Logger.log('VERY_LIKELY SPOOF CONTENT');
				valid = false;
				break;
			default:
				break;
		}
		switch (detections.medical) {
			// case 'LIKELY':
			// 	logger.log('LIKELY MEDICAL CONTENT');
			// 	valid = false;
			// 	break;
			case 'VERY_LIKELY':
				Logger.log('VERY_LIKELY MEDICAL CONTENT');
				valid = false;
				break;
			default:
				break;
		}
		switch (detections.violence) {
			// case 'POSSIBLE':
			// 	logger.log('POSSIBLE VIOLENCE CONTENT');
			// 	valid = false;
			// 	break;
			case 'LIKELY':
				Logger.log('LIKELY VIOLENCE CONTENT');
				valid = false;
				break;
			case 'VERY_LIKELY':
				Logger.log('VERY_LIKELY VIOLENCE CONTENT');
				valid = false;
				break;
			default:
				break;
		}
		switch (detections.racy) {
			// case 'LIKELY':
			// 	logger.log('LIKELY RACY CONTENT');
			// 	valid = false;
			// 	break;
			case 'VERY_LIKELY':
				Logger.log('VERY_LIKELY RACY CONTENT');
				valid = false;
				break;
			default:
				break;
		}
		return valid;
	};
	/**
	 * run google cloud vision api to validate image temp path
	 */
	public static validImageContent: (imageRef: string) => Promise<boolean> =
		async (imageRef) => {
			this.initGoogleCredentials();
			const imageFile = Firebase.storage.file(imageRef);
			const imagePath = path.join(os.tmpdir(), path.basename(imageFile.name));

			// fetch image metadata
			let imageMetadata: ListingImageMetadata;
			try {
				const res = await imageFile.getMetadata();
				imageMetadata = res[0].metadata;
				Logger.log(
					`Fetched image metadata for content validation: ${imageRef}`
				);
			} catch (error) {
				Logger.error(error);
				throw Logger.error(`[ERROR 0]: Can't fetch metadata: ${imageRef}`);
			}

			// if content already validated, skip validation
			if (imageMetadata.contentValidated === 'true') {
				return true;
			}

			// download image to temp path
			try {
				await imageFile.download({ destination: imagePath, validation: false });
				Logger.log(`Read downloaded image for validation: ${imageRef}`);
			} catch (error) {
				Logger.error(error);
				throw Logger.error(
					`[ERROR 1]: Cant' download image to temp path: ${imageRef}`
				);
			}

			let detections:
				| google.cloud.vision.v1.ISafeSearchAnnotation
				| null
				| undefined;
			try {
				const client = new vision.ImageAnnotatorClient();
				const [result] = await client.safeSearchDetection(imagePath);
				detections = result.safeSearchAnnotation;
			} catch (error) {
				Logger.error(error);
				throw Logger.error(
					`[ERROR 2]: Can't validate input image: ${imageRef}`
				);
			}
			if (!detections) {
				throw Logger.error(
					`[ERROR 3]: Validated detection is falsy: ${imageRef}`
				);
			}

			Logger.log(`Detected image features: ${imageRef}`);
			Logger.log(detections);

			if (!this.validDetection(detections)) {
				return false;
			}

			try {
				// yes, custom metadata is "metadata" for fb admin sdk, very weird
				await Firebase.storage.file(imageRef).setMetadata({
					metadata: {
						...imageMetadata,
						contentValidated: 'true',
					} as ListingImageMetadata,
				});
				Logger.log(`Updated image with validated image: ${imageRef}`);
			} catch (error) {
				throw Logger.error(
					`[ERROR 4]: Can't set metadata of validated image to cloud storage: ${imageRef}`
				);
			}
			return true;
		};
}
