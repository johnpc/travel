/**
 * Pure helpers for destination image generation — unit-tested, no I/O.
 * `imagePrompt` turns a destination name (+ optional blurb) into a photo prompt
 * for the scenery you'd actually experience there; `imageKey` is the S3 key.
 */
export function imagePrompt(name: string, blurb?: string | null): string {
  const scene = blurb?.trim() ? ` ${blurb.trim()}` : '';
  return [
    `A vivid, realistic travel photograph of ${name}.${scene}`,
    'Show the characteristic scenery, architecture, and views a traveler would experience:',
    'landscape, landmarks, light, and atmosphere. No text, no watermarks, no people posing.',
  ].join(' ');
}

/** S3 key for a destination's generated image (stable per destination). */
export function imageKey(destinationId: string): string {
  return `media/destinations/${destinationId}.webp`;
}
