import { defineAuth } from '@aws-amplify/backend';

/**
 * Auth for Travel.
 *
 * Travel is GUEST-FIRST and account-free: anyone with a trip URL collaborates
 * (see CLAUDE.md). All real CRUD happens as a guest via the identityPool
 * default. The `editors` group + a single test user exist ONLY to reuse the
 * proven seed/CI rig (the seed signs in as an editor to reset the shared
 * sandbox); they are not a user-facing gate.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ['editors'],
});
