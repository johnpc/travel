/**
 * A single persona's browser-driving agent loop. Each turn it sees a screenshot
 * + a compact list of interactive elements (from the live DOM) and calls ONE
 * tool: click / type / scroll / done. Uses Bedrock Claude (tool-forced) so it
 * behaves like a person clicking around, not a script. Vision + a11y snapshot
 * keeps it grounded in what's actually on screen.
 */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const MODEL_ID = process.env.PANEL_MODEL_ID || 'us.anthropic.claude-sonnet-4-5-20250929-v1:0';
const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-west-2' });

const TOOLS = [
  {
    name: 'act',
    description: 'Take one browser action, or finish when the goal is reached.',
    input_schema: {
      type: 'object',
      properties: {
        think: { type: 'string', description: 'One short sentence: what you see and why this action.' }, // prettier-ignore
        action: { type: 'string', description: 'One of: click, type, scroll, done' },
        ref: { type: 'string', description: 'For click/type: the [n] ref number of the target element.' }, // prettier-ignore
        text: { type: 'string', description: 'For type: the text to enter (a name, a destination, a chat message).' }, // prettier-ignore
        direction: { type: 'string', description: 'For scroll: up or down.' },
      },
      required: ['think', 'action'],
    },
  },
];

/** Ask the model for the next action given a screenshot + element list. */
export async function nextAction({ system, history, screenshotB64, elements }) {
  const elementText = elements
    .map((e) => `[${e.ref}] <${e.tag}> ${e.label}`.slice(0, 160))
    .join('\n');
  const userContent = [
    { type: 'image', source: { type: 'base64', media_type: 'image/png', data: screenshotB64 } },
    {
      type: 'text',
      text:
        `Interactive elements on screen (use the [ref] number):\n${elementText}\n\n` +
        `Rules: To enter text in a field, use action "type" with that field's [ref] and the "text" — ` +
        `it fills the field directly, you do NOT need to click it first. After typing into a form, the ` +
        `NEXT action is usually "click" on its submit button (Join / Add / send). Never repeat the same ` +
        `click twice — if something didn't change, do a DIFFERENT action (type, scroll, or click elsewhere). ` +
        `Pick ONE action via the act tool. When the group has converged on a destination + dates and ` +
        `you've had your say in chat, use action "done".`,
    },
  ];
  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 512,
    system,
    tools: TOOLS,
    tool_choice: { type: 'tool', name: 'act' },
    messages: [...history, { role: 'user', content: userContent }],
  });
  const res = await client.send(
    new InvokeModelCommand({ modelId: MODEL_ID, contentType: 'application/json', accept: 'application/json', body }), // prettier-ignore
  );
  const decoded = JSON.parse(new TextDecoder().decode(res.body));
  const call = (decoded.content || []).find((c) => c.type === 'tool_use' && c.name === 'act');
  return call?.input ?? { action: 'done', think: 'no action returned' };
}

export { MODEL_ID };
