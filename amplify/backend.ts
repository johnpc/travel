import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * TRAVEL backend.
 *
 * Guest-first, account-free (see CLAUDE.md). This slice is just auth + data
 * (Trip + Member). S3 storage for generated destination imagery and the
 * Bedrock generation Lambdas (destinations / activities / images) arrive with
 * their own vertical slices — not modeled ahead of a UI that uses them.
 */
defineBackend({
  auth,
  data,
});
