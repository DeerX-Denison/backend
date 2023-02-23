import { ObjectMetadata } from 'firebase-functions/v1/storage';
import Logger from '../../Logger';
import secrets from '../../secrets.json';

const logger = new Logger();

/**
 * verify if metadata of newly uploaded image is valid
 */
const validMetadata: (obj: ObjectMetadata) => boolean = (obj) => {
	const { kind, name, metadata, bucket, contentType } = obj;

	// if invalid custom metadata
	if (!metadata) {
		logger.log('Metadata not found');
		return false;
	}

	if (!metadata.resized) {
		logger.log('Metadata resized status not found');
		return false;
	}
	if (!metadata.contentValidated) {
		logger.log('Metadata contentValidated status not found');
		return false;
	}

	const { uploaderUid, imgId } = metadata;
	// invalid input obj: functions.storage.ObjectMetadata
	if (kind !== '#storage#object' && kind !== 'storage#object') {
		logger.log('Invalid kind');
		return false;
	}
	if (name !== `profilePhotos/${uploaderUid}/${imgId}`) {
		logger.log('Invalid name');
		return false;
	}
	if (bucket !== secrets.storageBucket) {
		logger.log('Invalid bucket');
		return false;
	}

	// invalid contentType
	if (!contentType) {
		logger.log('Content type not found');
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
		logger.log('Invalid content type');
		return false;
	}

	const ext = imgId.substring(imgId.indexOf('.') + 1);

	if (ext === 'jpg' || ext === 'jpeg') {
		if (
			contentType !== 'image/jpeg' &&
			contentType !== 'application/octet-stream'
		) {
			logger.log('Invalid extension for jpg/jpeg images');
			return false;
		}
	} else if (ext == 'png') {
		if (
			contentType !== 'image/png' &&
			contentType !== 'application/octet-stream'
		) {
			logger.log('Invalid content type for png images');
			return false;
		}
	} else if (ext === 'heic') {
		if (
			contentType !== 'image/heic' &&
			contentType !== 'application/octet-stream'
		) {
			logger.log('Invalid content type for heic images');
			return false;
		}
	} else if (ext === 'heif') {
		if (
			contentType !== 'image/heif' &&
			contentType !== 'application/octet-stream'
		) {
			logger.log('Invalid content type for heif images');
			return false;
		}
	} else {
		logger.log('Invalid file extension');
		return false;
	}

	return true;
};

export default validMetadata;
