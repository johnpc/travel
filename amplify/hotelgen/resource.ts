/**
 * The suggestHotels Lambda (custom-mutation resolver) — guest-callable, returns
 * AI hotel picks across price tiers + a median Airbnb price for a destination.
 * Synchronous: one tool-forced Claude call, well under the AppSync resolver
 * window. backend.ts grants it Bedrock InvokeModel.
 */
import { defineFunction } from '@aws-amplify/backend';

export const suggestHotels = defineFunction({
  name: 'suggest-hotels',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  resourceGroupName: 'data',
});
