/**
 * The estimateBudget Lambda (custom-mutation resolver) — guest-callable, returns
 * a rough AI cost estimate (flight/person from home airport, lodging/night,
 * nights) for a destination. Synchronous: one small tool-forced Claude call,
 * well under the AppSync resolver window. backend.ts grants it Bedrock
 * InvokeModel.
 */
import { defineFunction } from '@aws-amplify/backend';

export const estimateBudget = defineFunction({
  name: 'estimate-budget',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  resourceGroupName: 'data',
});
