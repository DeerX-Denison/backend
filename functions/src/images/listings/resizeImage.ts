import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import sharp from 'sharp';
import { LISTING_IMAGE_HEIGHT } from '../../constants';
import Logger from '../../Logger';
import { ListingImageMetadata } from '../../models/listing';
import { Firebase } from '../../services/firebase';

const logger = new Logger();

const resizeImage: (imageRef: string) => Promise<void> = async (imageRef) => {
	const imageFile = Firebase.storage.file(imageRef);
	const imagePath = path.join(os.tmpdir(), path.basename(imageFile.name));
	try {
		await imageFile.download({ destination: imagePath, validation: false });
		logger.log(`Downloaded image for resize: ${imageRef}`);
	} catch (error) {
		throw logger.error(`[ERROR 0]: Cant' download image to temp path`);
	}

	let imageBuffer: Buffer;
	try {
		imageBuffer = await fs.readFile(imagePath);
		logger.log(`Read downloaded image for resize: ${imageRef}`);
	} catch (error) {
		throw logger.error(`[ERROR 1]: Can't open downloaded images`);
	}

	let newImageBuffer: Buffer;
	try {
		newImageBuffer = await sharp(imageBuffer)
			.resize({ height: LISTING_IMAGE_HEIGHT })
			.jpeg()
			.toBuffer();
		logger.log(`Resized image and converted to array buffer: ${imageRef}`);
	} catch (error) {
		throw logger.error(
			`[ERROR 2]: Can't convert resized image to array buffer`
		);
	}

	const metaRes = await imageFile.getMetadata();
	const imageMetadata = ListingImageMetadata.parse(metaRes[0].metadata);

	try {
		await Firebase.storage.file(imageRef).save(newImageBuffer, {
			metadata: {
				metadata: ListingImageMetadata.parse({
					...imageMetadata,
					resized: 'true',
				}),
			},
		});
		logger.log(`Updated image with resized image: ${imageRef}`);
	} catch (error) {
		throw logger.error(`[ERROR 3]: Can't save resized image to cloud storage`);
	}

	try {
		await fs.unlink(imagePath);
		logger.log(`Delete temporary downloaded image: ${imageRef}`);
	} catch (error) {
		throw logger.error(`[ERROR 4]: Can't unlink temporary downloaded image`);
	}
};
export default resizeImage;
