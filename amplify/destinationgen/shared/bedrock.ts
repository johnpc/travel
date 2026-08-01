/**
 * Thin isolation wrapper over Bedrock — the only impure AI unit. Mocked in
 * handler tests; all prompt/parse logic lives in the pure modules.
 *
 * Claude Haiku 4.5: destination suggestion is a small, tool-forced, schema-bound
 * task (not reasoning-heavy), and the output is validated downstream — so the
 * cheapest capable model is the right call. Bump this constant if a task ever
 * needs a stronger model.
 */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export const TEXT_MODEL_ID = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';

const client = new BedrockRuntimeClient({});

/** Invoke Claude with a prepared Anthropic body; return decoded JSON. */
export async function invokeText(body: string): Promise<unknown> {
  const res = await client.send(
    new InvokeModelCommand({
      modelId: TEXT_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body,
    }),
  );
  return JSON.parse(new TextDecoder().decode(res.body));
}
