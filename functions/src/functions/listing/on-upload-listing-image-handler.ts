import { Listing } from '../../models/listing/listing';
import { ObjectMetadata } from '../../services/firebase';
import { Config } from '../../config';
import { ListingImageMetadata } from '../../models/image/listing-image-metadata';
import { CloudStorage } from '../../services/cloud-storage';
import { Utils } from '../../utils';
import fs from 'fs/promises';
import { Image } from '../../services/image';
import { CloudVision } from '../../services/cloud-vision';

export const onUploadListingImageHandler = async (
	obj: ObjectMetadata
): Promise<void> => {
	const ref = CloudStorage.extractObjectRefFromId(obj.id);

	const paths = CloudStorage.extractPathsFromRef(ref);

	const listingId = paths[1];

	const validContent = CloudStorage.validContentTypes(
		obj,
		Config.listingImageValidContentTypes
	);

	const validExtension = CloudStorage.validExtention(obj);

	if (!validContent || !validExtension) {
		await CloudStorage.delete(ref);
		return;
	}

	const metadata = await ListingImageMetadata.get(ref);

	if (
		metadata.contentValidated === 'false' &&
		!(await CloudVision.validateContent(ref))
	) {
		await CloudStorage.delete(ref);

		const listing = await Listing.get(listingId);

		const listingImageRefs = listing.images.map(
			CloudStorage.extractObjectRefFromUrl
		);

		const newImages = listingImageRefs.map((curRef, i) =>
			ref === curRef ? Config.invalidImageContentUrl : listing.images[i]
		);

		await Listing.update(listingId, { ...listing, images: newImages });

		return;
	}

	if (metadata.resized === 'false') {
		const fileName = CloudStorage.extractNameFromRef(ref);

		const tempPath = Utils.tempPath(fileName);

		await CloudStorage.download(ref, tempPath);

		const imageBuffer = await fs.readFile(tempPath);

		const resizedImageBuffer = await Image.resize(imageBuffer, {
			height: Config.listingImageHeight,
		});

		const metadata = await ListingImageMetadata.get(ref);

		metadata.resized = 'true';

		await CloudStorage.save(ref, resizedImageBuffer, metadata);

		await fs.unlink(tempPath);

		return;
	}
	return;
};
