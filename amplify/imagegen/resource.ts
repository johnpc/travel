/**
 * The generateDestinationImage Lambda (custom-mutation resolver) — guest-
 * callable, generates a representative image for a destination. Generates via
 * Bedrock, resizes to WebP, stores in S3, and persists the key on the
 * Destination row; returns { imagePath }. A single image call fits the resolver
 * window (given a generous timeout). backend.ts grants Bedrock + S3 + DDB.
 */
import { defineFunction } from '@aws-amplify/backend';

// sharp is a native module that can't be esbuild-bundled for Lambda, so it ships
// as a linux-x64 layer (built by scripts/build-sharp-layer.sh). Re-run that
// script when bumping sharp, then update this ARN.
export const SHARP_LAYER_ARN = 'arn:aws:lambda:us-west-2:566092841021:layer:travel-sharp:1';

export const generateDestinationImage = defineFunction({
  name: 'generate-destination-image',
  entry: './handler.ts',
  timeoutSeconds: 60,
  memoryMB: 1024, // sharp image resize headroom
  resourceGroupName: 'data',
  layers: { sharp: SHARP_LAYER_ARN },
});
