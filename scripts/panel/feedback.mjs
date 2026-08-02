/**
 * After a persona finishes planning, ask it for structured UX feedback, then a
 * synthesis pass collates all four into one ranked backlog. Both are tool-forced
 * so the output is clean JSON we can print and act on.
 */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { MODEL_ID } from './agent.mjs';

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-west-2' });

async function toolCall(system, userText, tool) {
  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2048,
    system,
    tools: [tool],
    tool_choice: { type: 'tool', name: tool.name },
    messages: [{ role: 'user', content: userText }],
  });
  const res = await client.send(
    new InvokeModelCommand({ modelId: MODEL_ID, contentType: 'application/json', accept: 'application/json', body }), // prettier-ignore
  );
  const decoded = JSON.parse(new TextDecoder().decode(res.body));
  return (decoded.content || []).find((c) => c.type === 'tool_use')?.input ?? {};
}

const FEEDBACK_TOOL = {
  name: 'give_feedback',
  description: 'Give honest UX feedback on the trip-planning experience you just had.',
  input_schema: {
    type: 'object',
    properties: {
      liked: { type: 'array', items: { type: 'string' }, description: 'What felt clear/delightful.' }, // prettier-ignore
      confused: { type: 'array', items: { type: 'string' }, description: 'What was confusing, missing, or frustrating.' }, // prettier-ignore
      reachedConsensus: { type: 'boolean', description: 'Did the group reach a clear decision?' },
      score: { type: 'integer', description: '1-10: how easy + delightful was it?' },
    },
    required: ['liked', 'confused', 'reachedConsensus', 'score'],
  },
};

/** Ask one persona for its reflection on the session. */
export function askFeedback(persona, transcript) {
  const system = `${persona.persona}\nYou just finished planning a group trip in a web app. Be candid and specific.`;
  const userText = `Here is what you did, step by step:\n${transcript}\n\nGive your honest feedback via give_feedback.`;
  return toolCall(system, userText, FEEDBACK_TOOL);
}

const SYNTH_TOOL = {
  name: 'synthesize',
  description: 'Collate 4 testers’ feedback into a ranked, actionable UX backlog.',
  input_schema: {
    type: 'object',
    properties: {
      topStrengths: { type: 'array', items: { type: 'string' } },
      backlog: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            issue: { type: 'string', description: 'The UX problem, concrete.' },
            severity: { type: 'string', description: 'high | medium | low' },
            raisedBy: { type: 'integer', description: 'How many of the 4 hit it.' },
            fix: { type: 'string', description: 'A concrete suggested fix.' },
          },
          required: ['issue', 'severity', 'fix'],
        },
      },
      consensusRate: { type: 'string', description: 'How many of the 4 felt the group decided.' },
    },
    required: ['topStrengths', 'backlog'],
  },
};

/** Collate all persona feedback into one prioritized backlog. */
export function synthesize(allFeedback) {
  const system =
    'You are a senior UX researcher. Four testers each planned a group trip in the same app and gave feedback. Merge overlapping points, rank by severity + how many hit them, and propose concrete fixes.';
  const userText = `The four testers' feedback (JSON):\n${JSON.stringify(allFeedback, null, 2)}\n\nProduce the ranked backlog via synthesize.`;
  return toolCall(system, userText, SYNTH_TOOL);
}
