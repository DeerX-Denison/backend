import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import sharp from 'sharp';
import { Logger } from '../services/logger';
import { ListingImageMetadata } from '../models/listing';
import { Firebase } from '../services/firebase';
import { Config } from '../config';

export class ImageResizer {
	public static resizeImage: (imageRef: string) => Promise<void> = async (
		imageRef
	) => {
		const imageFile = Firebase.storage.file(imageRef);
		const imagePath = path.join(os.tmpdir(), path.basename(imageFile.name));
		try {
			await imageFile.download({ destination: imagePath, validation: false });
			Logger.log(`Downloaded image for resize: ${imageRef}`);
		} catch (error) {
			throw Logger.error(`[ERROR 0]: Cant' download image to temp path`);
		}

		let imageBuffer: Buffer;
		try {
			imageBuffer = await fs.readFile(imagePath);
			Logger.log(`Read downloaded image for resize: ${imageRef}`);
		} catch (error) {
			throw Logger.error(`[ERROR 1]: Can't open downloaded images`);
		}

		let newImageBuffer: Buffer;
		try {
			newImageBuffer = await sharp(imageBuffer)
				.resize({ height: Config.listingImageHeight })
				.jpeg()
				.toBuffer();
			Logger.log(`Resized image and converted to array buffer: ${imageRef}`);
		} catch (error) {
			throw Logger.error(
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
			Logger.log(`Updated image with resized image: ${imageRef}`);
		} catch (error) {
			throw Logger.error(
				`[ERROR 3]: Can't save resized image to cloud storage`
			);
		}

		try {
			await fs.unlink(imagePath);
			Logger.log(`Delete temporary downloaded image: ${imageRef}`);
		} catch (error) {
			throw Logger.error(`[ERROR 4]: Can't unlink temporary downloaded image`);
		}
	};
}
