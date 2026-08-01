/**
 * Downscale + re-encode generated art to a small WebP. Stability returns a
 * ~1024px image; a destination card renders it modestly sized, so we shrink to
 * keep S3 objects small. Isolated edge (sharp is native); mocked in tests.
 * `fit: inside` never upscales and preserves aspect ratio.
 */
import sharp from 'sharp';

export const IMAGE_MAX = 800;

/** Resize raw image bytes to fit a max box, returning WebP bytes. */
export async function resizeWebp(bytes: Uint8Array, max = IMAGE_MAX): Promise<Uint8Array> {
  const out = await sharp(Buffer.from(bytes))
    .resize(max, max, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  return new Uint8Array(out);
}
