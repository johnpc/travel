import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { suggestDestinations } from './destinationgen/resource';

/**
 * TRAVEL backend.
 *
 * Guest-first, account-free (see CLAUDE.md). Auth + data (Trip / Member /
 * Destination) plus the suggestDestinations resolver, which calls Bedrock
 * (Claude) to suggest destinations — granted InvokeModel under its own IAM role.
 * S3 storage for generated destination imagery arrives with its own slice.
 */
const backend = defineBackend({
  auth,
  data,
  suggestDestinations,
});

// Bedrock InvokeModel on the Claude text models (tool-forced suggestions).
backend.suggestDestinations.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: [
      'arn:aws:bedrock:*::foundation-model/anthropic.*',
      'arn:aws:bedrock:*:*:inference-profile/*anthropic.*',
    ],
  }),
);
