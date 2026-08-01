/**
 * generateDestinationImage resolver. Guest-callable: builds a scenery prompt for
 * the destination, generates an image (Bedrock), resizes to a small WebP, stores
 * it in S3 under a stable key, persists that key on the Destination row, and
 * returns { imagePath }. Pure logic lives in ./shared; this is the glue.
 */
import { imagePrompt, imageKey } from './shared/imagePrompt';
import { generateImage } from './shared/bedrockImage';
import { resizeWebp } from './shared/resizeImage';
import { putMedia } from './shared/s3';
import { setDestinationImage } from './shared/ddb';
import type { Schema } from '../data/resource';

type Args = Schema['generateDestinationImage']['args'];

const env = (n: string): string => {
  const v = process.env[n];
  if (!v) throw new Error(`${n} not set`);
  return v;
};

export const handler: Schema['generateDestinationImage']['functionHandler'] = async (event) => {
  const { destinationId, name, blurb } = event.arguments as Args;
  const raw = await generateImage(imagePrompt(name, blurb));
  const bytes = await resizeWebp(raw);
  const key = imageKey(destinationId);
  await putMedia(env('MEDIA_BUCKET'), key, bytes, 'image/webp');
  await setDestinationImage(env('DESTINATION_TABLE'), destinationId, key);
  return { imagePath: key };
};
