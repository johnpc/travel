/**
 * Bedrock image generation edge (impure). Stability stable-image-core: a small,
 * low-cost text-to-image model. Returns raw PNG bytes; the caller resizes to a
 * small WebP before storing. Mocked in handler tests.
 */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export const IMAGE_MODEL_ID = 'stability.stable-image-core-v1:1';

const client = new BedrockRuntimeClient({});

/** Generate a square image from a prompt; return raw PNG bytes. */
export async function generateImage(prompt: string): Promise<Uint8Array> {
  const res = await client.send(
    new InvokeModelCommand({
      modelId: IMAGE_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({ prompt, aspect_ratio: '3:2', output_format: 'png' }),
    }),
  );
  const body = JSON.parse(new TextDecoder().decode(res.body)) as {
    images?: string[];
    finish_reasons?: (string | null)[];
  };
  const reason = body.finish_reasons?.[0];
  if (reason) throw new Error(`image generation did not complete: ${reason}`);
  const b64 = body.images?.[0];
  if (!b64) throw new Error('Stability response missing image');
  return Buffer.from(b64, 'base64');
}
