import sharp from 'sharp';

interface ResizeOpts {
	height?: number;
	width?: number;
}

export class Image {
	/**
	 * resize input image buffer with input options
	 * @param buf image buffer to resize
	 * @param opts resize buffer options
	 * @returns Promise resolves to buffer of resized image
	 */
	public static async resize(buf: Buffer, opts: ResizeOpts): Promise<Buffer> {
		return await sharp(buf)
			.resize({ height: opts.height, width: opts.width })
			.jpeg()
			.toBuffer();
	}
}
