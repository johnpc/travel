import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { suggestDestinations } from '../destinationgen/resource';
import { suggestActivities } from '../activitygen/resource';
import { estimateBudget } from '../budgetgen/resource';
import { suggestHotels } from '../hotelgen/resource';
import { suggestRoute } from '../routegen/resource';
import { generateDestinationImage } from '../imagegen/resource';

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
 * Grows one vertical slice at a time. Models so far:
 * - Trip:        the collaborative document, addressed by a unique URL `slug`.
 * - Member:      one person on a trip's roster (name-only identity).
 * - Destination: a candidate place on a trip's brainstorm (manual or AI-added).
 * - Interest:    one member's interest level in one destination (the votes).
 * - Availability: one member's free/busy status on one calendar day.
 * - Activity:    a thing to do at a destination (AI-suggested or hand-added).
 * - BudgetEstimate: a rough shared cost estimate per destination.
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
      destinations: a.hasMany('Destination', 'tripId'),
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

  // A candidate destination on a trip's brainstorm. Added manually by anyone on
  // the trip, or accepted from an AI suggestion. `source` records which. `blurb`
  // and `why` are the short descriptions (AI-filled, or null for a bare manual
  // add). Interest votes (later slice) reference a destination by id. Guest CRUD,
  // read by tripId in one query.
  Destination: a
    .model({
      tripId: a.id().required(),
      trip: a.belongsTo('Trip', 'tripId'),
      name: a.string().required(),
      blurb: a.string(),
      why: a.string(),
      source: a.enum(['MANUAL', 'AI']),
      imagePath: a.string(), // S3 key under media/destinations/, resolved via getUrl()
      interests: a.hasMany('Interest', 'destinationId'),
      activities: a.hasMany('Activity', 'destinationId'),
    })
    .secondaryIndexes((index) => [index('tripId')])
    .authorization((allow) => [
      allow.guest().to(['read', 'create', 'update', 'delete']),
      allow.authenticated('identityPool').to(['read', 'create', 'update', 'delete']),
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // A discussion message on a trip — the free-form channel where the crew hashes
  // out final consensus ("I'm in on Santorini if we do the catamaran", "can we
  // push a week later?"), the piece structured votes/dates can't capture.
  // `authorName` is the name-only identity; read a trip's whole thread by tripId
  // and sort by createdAt. Guest CRUD (delete your own typo) like the rest.
  Message: a
    .model({
      tripId: a.id().required(),
      authorName: a.string().required(),
      body: a.string().required(),
    })
    .secondaryIndexes((index) => [index('tripId')])
    .authorization((allow) => [
      allow.guest().to(['read', 'create', 'update', 'delete']),
      allow.authenticated('identityPool').to(['read', 'create', 'update', 'delete']),
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // One stop on a multi-city itinerary (opt-in — not every trip is multi-stop).
  // An ordered leg of a route like Tokyo → Angkor Wat → Bangkok → Phuket: a
  // `place`, how many `nights` there, and an `order` index the client sorts by
  // (reorder = update the order values). AI-suggested (a whole route at once) or
  // hand-added; `source` records which. Scoped to a trip, read by tripId. Guest
  // CRUD like the rest. Separate from single-destination voting.
  ItineraryStop: a
    .model({
      tripId: a.id().required(),
      place: a.string().required(),
      nights: a.integer(),
      order: a.integer().required(),
      note: a.string(),
      source: a.enum(['MANUAL', 'AI']),
    })
    .secondaryIndexes((index) => [index('tripId')])
    .authorization((allow) => [
      allow.guest().to(['read', 'create', 'update', 'delete']),
      allow.authenticated('identityPool').to(['read', 'create', 'update', 'delete']),
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // One person's interest level in one destination — the group's votes. Keyed by
  // a deterministic id (`<tripId>:<destinationId>:<memberName>`) so re-voting
  // UPSERTS the same row instead of piling up duplicates. `level` is an ordinal
  // enthusiasm scale. Read by destinationId (aggregate per card) or tripId (the
  // whole board's votes in one query). memberName is the name-only identity.
  // Guest CRUD like the rest.
  Interest: a
    .model({
      tripId: a.id().required(),
      destinationId: a.id().required(),
      destination: a.belongsTo('Destination', 'destinationId'),
      memberName: a.string().required(),
      level: a.enum(['YES', 'MAYBE', 'NO']),
    })
    .secondaryIndexes((index) => [index('destinationId'), index('tripId')])
    .authorization((allow) => [
      allow.guest().to(['read', 'create', 'update', 'delete']),
      allow.authenticated('identityPool').to(['read', 'create', 'update', 'delete']),
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // A thing to do at a destination — an AI-suggested (or hand-added) activity
  // idea, the kind of thing you'd find on GetYourGuide/Airbnb Experiences. Scoped
  // to a destination; `category` groups them (e.g. Sightseeing, Food, Outdoors).
  // A permanent brainstorm artifact like destinations. Guest CRUD, read by
  // destinationId in one query.
  Activity: a
    .model({
      tripId: a.id().required(),
      destinationId: a.id().required(),
      destination: a.belongsTo('Destination', 'destinationId'),
      title: a.string().required(),
      blurb: a.string(),
      category: a.string(),
      source: a.enum(['MANUAL', 'AI']),
    })
    .secondaryIndexes((index) => [index('destinationId')])
    .authorization((allow) => [
      allow.guest().to(['read', 'create', 'update', 'delete']),
      allow.authenticated('identityPool').to(['read', 'create', 'update', 'delete']),
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // A rough shared budget estimate for a destination — one per destination
  // (its id IS the destinationId, so anyone editing updates the same estimate).
  // Amounts are whole currency units (e.g. USD); per-person and per-couple
  // totals are computed client-side. `seasonNote` captures why prices vary
  // (high/low season, flight timing). Guest CRUD.
  BudgetEstimate: a
    .model({
      tripId: a.id().required(),
      destinationId: a.id().required(),
      flightPerPerson: a.integer(),
      lodgingPerNight: a.integer(),
      nights: a.integer(),
      seasonNote: a.string(),
    })
    .secondaryIndexes((index) => [index('destinationId')])
    .authorization((allow) => [
      allow.guest().to(['read', 'create', 'update', 'delete']),
      allow.authenticated('identityPool').to(['read', 'create', 'update', 'delete']),
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // One member's availability on one calendar day for a trip. Keyed by a
  // deterministic id (`<tripId>:<date>:<memberName>`) so re-marking a day UPSERTS
  // instead of duplicating. `date` is a YYYY-MM-DD day stamp; `status` is the
  // member's availability that day. Read all of a trip's marks by tripId and
  // aggregate per day client-side to find the dates that work for everyone.
  // Guest CRUD, name-only identity, like the rest.
  Availability: a
    .model({
      tripId: a.id().required(),
      memberName: a.string().required(),
      date: a.string().required(),
      status: a.enum(['FREE', 'MAYBE', 'BUSY']),
    })
    .secondaryIndexes((index) => [index('tripId')])
    .authorization((allow) => [
      allow.guest().to(['read', 'create', 'update', 'delete']),
      allow.authenticated('identityPool').to(['read', 'create', 'update', 'delete']),
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // Guest-callable AI suggestion of destinations for a trip. Synchronous: the
  // resolver builds a tool-forced Claude request and returns clean suggestions
  // (name + blurb + why). It does NOT persist anything — the client shows them
  // and the user accepts the ones they like into Destination rows. Excludes
  // names already on the trip so it doesn't repeat. `suggestions` is a JSON
  // string of [{name,blurb,why}] (Amplify custom types don't nest arrays
  // cleanly); the client parses it.
  suggestDestinations: a
    .mutation()
    .arguments({
      tripTitle: a.string(),
      count: a.integer(),
      exclude: a.string().array(),
    })
    .returns(a.customType({ suggestions: a.string().required() }))
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(suggestDestinations)),

  // Guest-callable AI suggestion of ACTIVITIES for a specific destination.
  // Synchronous tool-forced Claude call; returns a JSON string of
  // [{title, blurb, category}] the client parses and lets the user accept into
  // Activity rows. Excludes titles already listed so it doesn't repeat.
  suggestActivities: a
    .mutation()
    .arguments({
      destinationName: a.string().required(),
      count: a.integer(),
      exclude: a.string().array(),
    })
    .returns(a.customType({ suggestions: a.string().required() }))
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(suggestActivities)),

  // Guest-callable AI ROUGH BUDGET estimate for a destination. Synchronous
  // tool-forced Claude call; returns a JSON string of
  // { flightPerPerson, lodgingPerNight, nights, seasonNote } the client uses to
  // seed the editable budget fields (it does NOT persist — the group verifies
  // against the real-price links and saves). `homeAirport` defaults to DTW.
  estimateBudget: a
    .mutation()
    .arguments({
      destinationName: a.string().required(),
      homeAirport: a.string(),
    })
    .returns(a.customType({ estimate: a.string().required() }))
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(estimateBudget)),

  // Guest-callable AI HOTEL suggestions for a destination. Synchronous
  // tool-forced Claude call; returns a JSON string of
  // { hotels: [{name,tier,pricePerNight,area,pros,cons}], airbnbMedianPerNight }
  // the client renders with Booking.com/Maps SEARCH links (which resolve to the
  // real property + its real photos — never a hallucinated listing URL). Not
  // persisted; it's a lookup to help decide where to stay.
  suggestHotels: a
    .mutation()
    .arguments({ destinationName: a.string().required() })
    .returns(a.customType({ suggestions: a.string().required() }))
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(suggestHotels)),

  // Guest-callable AI MULTI-CITY ROUTE suggestion. Synchronous tool-forced
  // Claude call; returns a JSON string of ordered [{place,nights,note}] the
  // client shows and the user adds as ItineraryStop rows. Excludes stops already
  // on the itinerary so it complements them. Not persisted.
  suggestRoute: a
    .mutation()
    .arguments({ theme: a.string(), exclude: a.string().array() })
    .returns(a.customType({ stops: a.string().required() }))
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(suggestRoute)),

  // Guest-callable: generate a representative image for a destination. The
  // resolver generates via Bedrock, resizes to WebP, stores it in S3, persists
  // the key on the Destination row, and returns { imagePath }. The client then
  // resolves the key to a URL via getUrl().
  generateDestinationImage: a
    .mutation()
    .arguments({
      destinationId: a.id().required(),
      name: a.string().required(),
      blurb: a.string(),
    })
    .returns(a.customType({ imagePath: a.string().required() }))
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(generateDestinationImage)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});
