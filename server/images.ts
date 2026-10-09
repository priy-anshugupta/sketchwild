import sharp from 'sharp';
import { ApiError } from './coach';
export async function normalizeImage(bytes: Buffer, maxEdge: number): Promise<Buffer> {
  try {
    const image = sharp(bytes, { limitInputPixels: 24000000, failOn: 'error' });
    const metadata = await image.metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format || '') || (metadata.pages || 1) > 1) throw new Error();
    return await image.rotate().resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 88 }).toBuffer();
  } catch { throw new ApiError(400, 'INVALID_IMAGE', 'One picture could not be read. Choose a clear JPEG, PNG, or WebP under 24 megapixels.'); }
}
