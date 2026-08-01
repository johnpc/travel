/**
 * The suggestActivities Lambda (custom-mutation resolver) — guest-callable,
 * returns AI-suggested activities for a destination. Synchronous: one small
 * tool-forced Claude call, well under the AppSync resolver window. backend.ts
 * grants it Bedrock InvokeModel.
 */
import { defineFunction } from '@aws-amplify/backend';

export const suggestActivities = defineFunction({
  name: 'suggest-activities',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  resourceGroupName: 'data',
});
