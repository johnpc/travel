/** Seed the demo trips + their rosters (idempotent via clearAll upstream). */
import { client, clearOneModel, EDITOR_WRITE } from './seedClient';
import { TRIP_FIXTURES } from './fixtures/trips';

/** Wipe every Member then Trip (children first) so re-seeding is clean. */
export async function clearAll(): Promise<void> {
  await clearOneModel(client.models.Member);
  await clearOneModel(client.models.Trip);
}

/** Insert each fixture trip and its roster of named members. */
export async function seedTripData(): Promise<void> {
  for (const fixture of TRIP_FIXTURES) {
    const { data: trip, errors } = await client.models.Trip.create(
      { slug: fixture.slug, title: fixture.title, description: fixture.description },
      EDITOR_WRITE,
    );
    if (errors?.length || !trip) {
      throw new Error(`Failed to seed trip ${fixture.slug}: ${JSON.stringify(errors)}`);
    }
    await Promise.all(
      fixture.members.map((name) =>
        client.models.Member.create({ tripId: trip.id, name }, EDITOR_WRITE),
      ),
    );
    console.log(`Seeded trip ${fixture.slug} with ${fixture.members.length} members.`);
  }
}
