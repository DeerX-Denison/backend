import path from 'path';
import fs from 'fs/promises';
import { google } from '@google-cloud/vision/build/protos/protos';
import vision from '@google-cloud/vision';
import { InternalError } from '../models/error/internal-error';
import { Logger } from './logger';
import { Utils } from '../utils/utils';
import { CloudStorage } from './cloud-storage';
import { ListingImageMetadata } from '../models/image/listing-image-metadata';

export class CloudVision {
	/**
	 * initialize google api credential
	 */
	private static initGoogleCredentials = () => {
		const secretPath = path.resolve(__dirname, '..', 'secrets.json');
		process.env['GOOGLE_APPLICATION_CREDENTIALS'] = secretPath;
	};

	/**
	 * detect input image buffer content
	 * @param buf image buffer to detect content
	 * @returns Google's safe search annotation result
	 */
	private static async detectContent(
		buf: Buffer
	): Promise<google.cloud.vision.v1.ISafeSearchAnnotation> {
		const client = new vision.ImageAnnotatorClient();
		const [result] = await client.safeSearchDetection(buf);
		if (!result.safeSearchAnnotation)
			throw new InternalError(new Error('Fail to detect image content'));
		return result.safeSearchAnnotation;
	}

	/**
	 * check input detection if it passes validity check
	 * @param detections Google safe search annotation result
	 * @returns true of image content detection is valid, false otherwise
	 */
	private static async validDetection(
		detections: google.cloud.vision.v1.ISafeSearchAnnotation
	): Promise<boolean> {
		let valid = true;
		switch (detections.adult) {
			case 'VERY_LIKELY':
				Logger.log('VERY_LIKELY ADULT CONTENT');
				valid = false;
				break;
			default:
				break;
		}
		switch (detections.spoof) {
			case 'VERY_LIKELY':
				Logger.log('VERY_LIKELY SPOOF CONTENT');
				valid = false;
				break;
			default:
				break;
		}
		switch (detections.medical) {
			case 'VERY_LIKELY':
				Logger.log('VERY_LIKELY MEDICAL CONTENT');
				valid = false;
				break;
			default:
				break;
		}
		switch (detections.violence) {
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
			case 'VERY_LIKELY':
				Logger.log('VERY_LIKELY RACY CONTENT');
				valid = false;
				break;
			default:
				break;
		}
		return valid;
	}

	/**
	 * check input image reference to have valid content. Update
	 * image reference metatdata after finish validation.
	 * @param ref input image reference to check for valid content
	 * @returns true of image content detection is valid, false otherwise
	 */
	public static async validateContent(ref: string): Promise<boolean> {
		const imageMetadata = await ListingImageMetadata.get(ref);

		if (imageMetadata.contentValidated === 'true') {
			return true;
		}

		this.initGoogleCredentials();

		const fileName = CloudStorage.extractNameFromRef(ref);

		const tempPath = Utils.tempPath(fileName);

		await CloudStorage.download(ref, tempPath);

		const buf = await fs.readFile(tempPath);

		const detections = await this.detectContent(buf);

		if (!this.validDetection(detections)) {
			return false;
		}

		await CloudStorage.setMetadata(
			ref,
			ListingImageMetadata.parse({
				...imageMetadata,
				contentValidated: 'true',
			})
		);

		return true;
	}
}
