import path from 'path';
import { NotFoundError } from '../models/error/not-found-error';
import { Firebase, ObjectMetadata } from './firebase';
import { InternalError } from '../models/error/internal-error';

export class CloudStorage {
	/**
	 * extract object reference from input object id
	 * @param id input id to extract object reference
	 * @returns object reference and its path
	 */
	public static extractObjectRefFromId(id: string): string {
		return id.substring(id.indexOf('/') + 1, id.lastIndexOf('/'));
	}

	/**
	 * extract path components from input object reference
	 * @param ref input object reference to extract
	 * @returns path component of object
	 */
	public static extractPathsFromRef(ref: string): string[] {
		return ref.split('/');
	}

	/**
	 * extract name of input object reference
	 * @param ref input object reference to extract
	 * @returns name of input object reference
	 */
	public static extractNameFromRef(ref: string): string {
		const file = Firebase.storage.file(ref);
		return path.basename(file.name);
	}

	/**
	 * extract reference to an object in cloud storage from input object url
	 * @param objectUrl object url to extract reference
	 * @returns object reference in cloud storage
	 */
	public static extractObjectRefFromUrl(objectUrl: string): string {
		return objectUrl
			.substring(objectUrl.lastIndexOf('/') + 1, objectUrl.lastIndexOf('?'))
			.replace(/%2F/g, '/');
	}

	/**
	 * validate input object metadata exist in input valid content types
	 * @param obj object metadata to validate
	 * @param validContentTypes list of valid content types
	 */
	public static validContentTypes(
		obj: ObjectMetadata,
		validContentTypes: string[]
	) {
		if (!obj.contentType)
			throw new InternalError(new Error('Object does not have contentType'));
		return validContentTypes
			.map((_) => _.toLowerCase().trim())
			.includes(obj.contentType.toLowerCase().trim());
	}

	/**
	 * check if input object metdata has file extension
	 * that matches its content type
	 * @param obj object metadata to validate
	 * @returns true of object metadata has file extension
	 * matches to its content type
	 */
	public static validExtention(obj: ObjectMetadata) {
		const ref = this.extractObjectRefFromId(obj.id);

		const name = this.extractNameFromRef(ref);

		const ext = name.substring(name.indexOf('.') + 1);

		if (ext === 'jpg' || ext === 'jpeg') {
			if (
				obj.contentType !== 'image/jpeg' &&
				obj.contentType !== 'application/octet-stream'
			) {
				return false;
			}
		} else if (ext == 'png') {
			if (
				obj.contentType !== 'image/png' &&
				obj.contentType !== 'application/octet-stream'
			) {
				return false;
			}
		} else if (ext === 'heic') {
			if (
				obj.contentType !== 'image/heic' &&
				obj.contentType !== 'application/octet-stream'
			) {
				return false;
			}
		} else if (ext === 'heif') {
			if (
				obj.contentType !== 'image/heif' &&
				obj.contentType !== 'application/octet-stream'
			) {
				return false;
			}
		} else {
			return false;
		}

		return true;
	}

	/**
	 * delete an object in cloud storage from input image reference
	 * @param ref object reference to delete
	 */
	public static async delete(ref: string): Promise<void> {
		const file = Firebase.storage.file(ref);
		const [exists] = await file.exists();
		// if (!exists) throw new NotFoundError(new Error('Image not exists'));
		// For now, ignore non-existent reference
		if (!exists) return;
		await file.delete();
	}

	/**
	 * download an object base on input object reference to input path
	 * @param ref object reference to download
	 * @param path path to download object to
	 */
	public static async download(ref: string, path: string): Promise<void> {
		const file = Firebase.storage.file(ref);
		const [exists] = await file.exists();
		if (!exists) throw new NotFoundError(new Error('Image not exists'));
		await file.download({ destination: path, validation: false });
	}

	/**
	 * save an object to input reference with data as input buffer
	 * with input metadata
	 * @param ref object reference to save to
	 * @param buf object data to save
	 * @param metadata metadata of object
	 */
	public static async save(
		ref: string,
		buf: Buffer,
		metadata: unknown
	): Promise<void> {
		await Firebase.storage.file(ref).save(buf, {
			metadata: { metadata },
		});
	}

	/**
	 * set input object reference's metadata to input metadata
	 * @param ref object reference to set metadata
	 * @param metadata metadata to set
	 */
	public static async setMetadata(
		ref: string,
		metadata: unknown
	): Promise<void> {
		await Firebase.storage.file(ref).setMetadata({
			metadata: { metadata },
		});
	}
}
