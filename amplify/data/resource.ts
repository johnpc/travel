import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * TRAVEL data schema.
 *
 * Travel is a guest-first, account-free group-trip planner (see CLAUDE.md).
 * Every trip lives at travel.jpc.io/<slug>; everyone who has the URL is a
 * trusted collaborator. So the collaborative models grant GUEST CRUD (not just
 * read) — this diverges from spork's editor-gated content because there are no
 * accounts and no owner. Identity is name-only: a Member row per person on the
 * trip roster; interest/votes reference a member by name (added in a later
 * slice). The `editors` group grant is kept only so the seed/CI rig can reset
 * the shared sandbox as an editor.
 *
 * Grows one vertical slice at a time. This slice ships:
 * - Trip:   the collaborative document, addressed by a unique URL `slug`.
 * - Member: one person on a trip's roster (name-only identity).
 */
const schema = a.schema({
  // The trip itself — the shared document at travel.jpc.io/<slug>. `slug` is the
  // URL key (unique, human-chosen, e.g. "greece-2027"); `title` is the display
  // name. Opening a slug that doesn't exist creates the trip (first-visit); the
  // slug GSI makes that lookup a single query, not a scan.
  Trip: a
    .model({
      slug: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      members: a.hasMany('Member', 'tripId'),
    })
    .secondaryIndexes((index) => [index('slug')])
    .authorization((allow) => [
      allow.guest().to(['read', 'create', 'update', 'delete']),
      allow.authenticated('identityPool').to(['read', 'create', 'update', 'delete']),
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // One person on a trip's roster. Identity is name-only (see CLAUDE.md): a
  // member is just a `name` scoped to a `tripId`. Stored server-side so the same
  // person is recognized across devices — the device only auto-selects the name
  // locally. Interest/votes (later slice) reference a member by name within the
  // trip. Guest CRUD so anyone with the URL can add themselves or others.
  Member: a
    .model({
      tripId: a.id().required(),
      trip: a.belongsTo('Trip', 'tripId'),
      name: a.string().required(),
    })
    // Read a trip's whole roster in one query.
    .secondaryIndexes((index) => [index('tripId')])
    .authorization((allow) => [
      allow.guest().to(['read', 'create', 'update', 'delete']),
      allow.authenticated('identityPool').to(['read', 'create', 'update', 'delete']),
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});
