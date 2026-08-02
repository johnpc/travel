/** Seed the demo trips + their rosters (idempotent via clearAll upstream). */
import { client, clearOneModel, EDITOR_WRITE } from './seedClient';
import { TRIP_FIXTURES } from './fixtures/trips';
import { seedMembers, seedDestinations, seedVotesAndAvailability } from './seedTripChildren';

/** Wipe every child then Trip (children first) so re-seeding is clean — this is
 * what keeps the shared sandbox at a known state each run (no drift). */
export async function clearAll(): Promise<void> {
  await clearOneModel(client.models.Interest);
  await clearOneModel(client.models.Availability);
  await clearOneModel(client.models.Activity);
  await clearOneModel(client.models.BudgetEstimate);
  await clearOneModel(client.models.ItineraryStop);
  await clearOneModel(client.models.Message);
  await clearOneModel(client.models.Member);
  await clearOneModel(client.models.Destination);
  await clearOneModel(client.models.Trip);
}

/** Insert each fixture trip and all its child records. */
export async function seedTripData(): Promise<void> {
  for (const fixture of TRIP_FIXTURES) {
    const { data: trip, errors } = await client.models.Trip.create(
      { slug: fixture.slug, title: fixture.title, description: fixture.description },
      EDITOR_WRITE,
    );
    if (errors?.length || !trip) {
      throw new Error(`Failed to seed trip ${fixture.slug}: ${JSON.stringify(errors)}`);
    }
    await seedMembers(trip.id, fixture);
    const destId = await seedDestinations(trip.id, fixture);
    await seedVotesAndAvailability(trip.id, fixture, destId);
    console.log(
      `Seeded ${fixture.slug}: ${fixture.members.length} members, ${fixture.destinations.length} destinations, ${fixture.votes.length} votes, ${fixture.availability.length} avail, ${fixture.budgets.length} budgets.`,
    );
  }
}
