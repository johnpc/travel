/**
 * The suggestDestinations Lambda (custom-mutation resolver) — the guest-callable
 * entry that returns AI-suggested destinations for a trip. Synchronous: a single
 * small tool-forced Claude call, well under the AppSync resolver window, so there
 * is no worker. backend.ts grants it Bedrock InvokeModel.
 */
import { defineFunction } from '@aws-amplify/backend';

export const suggestDestinations = defineFunction({
  name: 'suggest-destinations',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  // Custom-mutation resolver → data stack (avoids the data<->function
  // nested-stack circular dependency CloudFormation rejects).
  resourceGroupName: 'data',
});
