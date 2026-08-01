/**
 * Seed fixtures (DATA, not logic — exempt from the line gate). A small, known
 * set of trips + rosters the e2e suite asserts against on the shared sandbox.
 */
export interface DestinationFixture {
  name: string;
  blurb: string;
  why: string;
  source: 'MANUAL' | 'AI';
}

export interface VoteFixture {
  /** Destination name this vote is on (matched to the created row). */
  destination: string;
  memberName: string;
  level: 'YES' | 'MAYBE' | 'NO';
}

export interface TripFixture {
  slug: string;
  title: string;
  description: string;
  members: string[];
  destinations: DestinationFixture[];
  votes: VoteFixture[];
}

export const TRIP_FIXTURES: TripFixture[] = [
  {
    slug: 'greece-2027',
    title: 'Greece 2027',
    description: 'Island hopping and ancient ruins with the whole crew.',
    members: ['Alex', 'Sam', 'Priya', 'Jordan'],
    destinations: [
      {
        name: 'Santorini, Greece',
        blurb: 'Whitewashed cliffs and blue domes over a sunken volcanic caldera.',
        why: 'The postcard-perfect sunset spot everyone pictures for a group trip.',
        source: 'AI',
      },
      {
        name: 'Athens, Greece',
        blurb: 'Ancient ruins and buzzing neighborhoods at the foot of the Acropolis.',
        why: 'Easy to reach and packed with history plus great group dining.',
        source: 'MANUAL',
      },
    ],
    votes: [
      { destination: 'Santorini, Greece', memberName: 'Alex', level: 'YES' },
      { destination: 'Santorini, Greece', memberName: 'Priya', level: 'YES' },
      { destination: 'Santorini, Greece', memberName: 'Sam', level: 'MAYBE' },
      { destination: 'Athens, Greece', memberName: 'Alex', level: 'MAYBE' },
      { destination: 'Athens, Greece', memberName: 'Jordan', level: 'NO' },
    ],
  },
  {
    slug: 'demo-trip',
    title: 'Demo Trip',
    description: 'A sample trip to explore how Travel works.',
    members: ['Alex', 'Sam'],
    destinations: [],
    votes: [],
  },
];
