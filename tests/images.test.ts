import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { normalizeImage } from '../server/images';
import { ApiError } from '../server/coach';
test('normalization applies camera orientation and removes metadata', async () => {
  const input = await sharp({ create: { width: 480, height: 240, channels: 3, background: '#557744' } }).jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const output = await normalizeImage(input, 300);
  const info = await sharp(output).metadata();
  assert.equal(info.format, 'jpeg');
  assert.equal(info.width, 150); assert.equal(info.height, 300);
  assert.equal(info.exif, undefined); assert.equal(info.orientation, undefined);
});
test('rejects bytes that are not a supported raster image', async () => {
  await assert.rejects(normalizeImage(Buffer.from('not a photograph'), 640), (error: unknown) => error instanceof ApiError && error.code === 'INVALID_IMAGE');
  await assert.rejects(normalizeImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>'), 640), (error: unknown) => error instanceof ApiError && error.code === 'INVALID_IMAGE');
});
