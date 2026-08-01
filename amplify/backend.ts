import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { suggestDestinations } from './destinationgen/resource';
import { suggestActivities } from './activitygen/resource';
import { generateDestinationImage } from './imagegen/resource';

/**
 * TRAVEL backend.
 *
 * Guest-first, account-free (see CLAUDE.md). Auth + data + S3 storage, plus the
 * AI resolvers: suggestDestinations / suggestActivities (Bedrock Claude text)
 * and generateDestinationImage (Bedrock image → sharp → S3 → persist the key on
 * the Destination row). All call Bedrock under their own IAM roles.
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  suggestDestinations,
  suggestActivities,
  generateDestinationImage,
});

// Bedrock InvokeModel on the Claude text + Stability image models.
const bedrockGrant = () =>
  new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: [
      'arn:aws:bedrock:*::foundation-model/anthropic.*',
      'arn:aws:bedrock:*:*:inference-profile/*anthropic.*',
      'arn:aws:bedrock:*::foundation-model/stability.*',
    ],
  });

backend.suggestDestinations.resources.lambda.addToRolePolicy(bedrockGrant());
backend.suggestActivities.resources.lambda.addToRolePolicy(bedrockGrant());

// Image generator: Bedrock (image) + write media to S3 + persist the key on the
// Destination table (writes straight to DynamoDB under its IAM role).
const imageFn = backend.generateDestinationImage.resources.lambda;
const bucket = backend.storage.resources.bucket;
const destinationTable = backend.data.resources.tables['Destination'];
imageFn.addToRolePolicy(bedrockGrant());
bucket.grantWrite(imageFn, 'media/destinations/*');
destinationTable.grantWriteData(imageFn);
backend.generateDestinationImage.addEnvironment('MEDIA_BUCKET', bucket.bucketName);
backend.generateDestinationImage.addEnvironment('DESTINATION_TABLE', destinationTable.tableName);
