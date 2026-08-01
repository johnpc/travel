/**
 * Seed fixtures (DATA, not logic — exempt from the line gate). A small, known
 * set of trips + rosters the e2e suite asserts against on the shared sandbox.
 */
export interface TripFixture {
  slug: string;
  title: string;
  description: string;
  members: string[];
}

export const TRIP_FIXTURES: TripFixture[] = [
  {
    slug: 'greece-2027',
    title: 'Greece 2027',
    description: 'Island hopping and ancient ruins with the whole crew.',
    members: ['Alex', 'Sam', 'Priya', 'Jordan'],
  },
  {
    slug: 'demo-trip',
    title: 'Demo Trip',
    description: 'A sample trip to explore how Travel works.',
    members: ['Alex', 'Sam'],
  },
];
