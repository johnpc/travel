/**
 * The suggestRoute Lambda (custom-mutation resolver) — guest-callable, returns
 * an ordered multi-city route (stops + nights) for a trip. Synchronous: one
 * tool-forced Claude call, well under the AppSync resolver window. backend.ts
 * grants it Bedrock InvokeModel.
 */
import { defineFunction } from '@aws-amplify/backend';

export const suggestRoute = defineFunction({
  name: 'suggest-route',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  resourceGroupName: 'data',
});
