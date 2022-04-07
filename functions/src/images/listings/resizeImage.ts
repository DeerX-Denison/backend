import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import sharp from 'sharp';
import { ListingImageMetadata } from 'types';
import { LISTING_IMAGE_HEIGHT } from '../../constants';
import { storage } from '../../firebase.config';
import Logger from '../../Logger';

const logger = new Logger();

const resizeImage: (imageRef: string) => Promise<void> = async (imageRef) => {
	const imageFile = storage.file(imageRef);
	const imagePath = path.join(os.tmpdir(), path.basename(imageFile.name));
	try {
		await imageFile.download({ destination: imagePath, validation: false });
	} catch (error) {
		throw logger.error(`[ERROR 0]: Cant' download image to temp path`);
	}

	let imageBuffer: Buffer;
	try {
		imageBuffer = await fs.readFile(imagePath);
	} catch (error) {
		throw logger.error(`[ERROR 1]: Can't open downloaded images`);
	}

	let newImageBuffer: Buffer;
	try {
		newImageBuffer = await sharp(imageBuffer)
			.resize({ height: LISTING_IMAGE_HEIGHT })
			.toBuffer();
	} catch (error) {
		throw logger.error(
			`[ERROR 2]: Can't convert resized image to array buffer`
		);
	}

	const metaRes = await imageFile.getMetadata();
	const imageMetadata: ListingImageMetadata = metaRes[0].metadata;

	try {
		await storage.file(imageRef).save(newImageBuffer, {
			metadata: {
				metadata: { ...imageMetadata, resized: 'true' } as ListingImageMetadata,
			},
		});
	} catch (error) {
		throw logger.error(`[ERROR 3]: Can't save resized image to cloud storage`);
	}

	try {
		await fs.unlink(imagePath);
	} catch (error) {
		throw logger.error(`[ERROR 4]: Can't unlink temporary downloaded image`);
	}
};
export default resizeImage;
