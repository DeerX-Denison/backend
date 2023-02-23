import vision from '@google-cloud/vision';
import { google } from '@google-cloud/vision/build/protos/protos';
import os from 'os';
import path from 'path';
import { ListingImageMetadata } from 'types';
import Logger from '../Logger';
import { Firebase } from '../services/firebase-service';

const logger = new Logger();

/**
 * initialize google api credential
 */
const initGoogleCredentials = () => {
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
const validDetection: (
	detections: google.cloud.vision.v1.ISafeSearchAnnotation
) => boolean = (detections) => {
	let valid = true;
	switch (detections.adult) {
		// case 'LIKELY':
		// 	logger.log('LIKELY ADULT CONTENT');
		// 	valid = false;
		// 	break;
		case 'VERY_LIKELY':
			logger.log('VERY_LIKELY ADULT CONTENT');
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
			logger.log('VERY_LIKELY SPOOF CONTENT');
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
			logger.log('VERY_LIKELY MEDICAL CONTENT');
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
			logger.log('LIKELY VIOLENCE CONTENT');
			valid = false;
			break;
		case 'VERY_LIKELY':
			logger.log('VERY_LIKELY VIOLENCE CONTENT');
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
			logger.log('VERY_LIKELY RACY CONTENT');
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
const validImageContent: (imageRef: string) => Promise<boolean> = async (
	imageRef
) => {
	initGoogleCredentials();
	const imageFile = Firebase.storage.file(imageRef);
	const imagePath = path.join(os.tmpdir(), path.basename(imageFile.name));

	// fetch image metadata
	let imageMetadata: ListingImageMetadata;
	try {
		const res = await imageFile.getMetadata();
		imageMetadata = res[0].metadata;
		logger.log(`Fetched image metadata for content validation: ${imageRef}`);
	} catch (error) {
		logger.error(error);
		throw logger.error(`[ERROR 0]: Can't fetch metadata: ${imageRef}`);
	}

	// if content already validated, skip validation
	if (imageMetadata.contentValidated === 'true') {
		return true;
	}

	// download image to temp path
	try {
		await imageFile.download({ destination: imagePath, validation: false });
		logger.log(`Read downloaded image for validation: ${imageRef}`);
	} catch (error) {
		logger.error(error);
		throw logger.error(
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
		logger.error(error);
		throw logger.error(`[ERROR 2]: Can't validate input image: ${imageRef}`);
	}
	if (!detections) {
		throw logger.error(`[ERROR 3]: Validated detection is falsy: ${imageRef}`);
	}

	logger.log(`Detected image features: ${imageRef}`);
	logger.log(detections);

	if (!validDetection(detections)) {
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
		logger.log(`Updated image with validated image: ${imageRef}`);
	} catch (error) {
		throw logger.error(
			`[ERROR 4]: Can't set metadata of validated image to cloud storage: ${imageRef}`
		);
	}
	return true;
};
export default validImageContent;
