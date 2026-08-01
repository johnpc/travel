import { defineStorage } from '@aws-amplify/backend';

/**
 * S3 storage for generated destination imagery. Objects under
 * `media/destinations/*` are publicly readable (guest + authenticated) so the
 * guest-first client can load them via getUrl(). The imagegen Lambda gets a
 * scoped write grant in backend.ts (it writes under its own IAM role).
 */
export const storage = defineStorage({
  name: 'travelMedia',
  access: (allow) => ({
    'media/destinations/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['editors']).to(['read', 'write', 'delete']),
    ],
  }),
});
