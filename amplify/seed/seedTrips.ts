/** Seed the demo trips + their rosters (idempotent via clearAll upstream). */
import { client, clearOneModel, EDITOR_WRITE } from './seedClient';
import { TRIP_FIXTURES } from './fixtures/trips';

/** Wipe every child then Trip (children first) so re-seeding is clean — this is
 * what keeps the shared sandbox at a known state each run (no drift). */
export async function clearAll(): Promise<void> {
  await clearOneModel(client.models.Interest);
  await clearOneModel(client.models.Availability);
  await clearOneModel(client.models.Activity);
  await clearOneModel(client.models.BudgetEstimate);
  await clearOneModel(client.models.Member);
  await clearOneModel(client.models.Destination);
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
    // Create destinations, keeping a name→id map so votes can reference them.
    const destIdByName: Record<string, string> = {};
    for (const d of fixture.destinations) {
      const { data: dest } = await client.models.Destination.create(
        { tripId: trip.id, name: d.name, blurb: d.blurb, why: d.why, source: d.source },
        EDITOR_WRITE,
      );
      if (dest) destIdByName[d.name] = dest.id;
    }
    await Promise.all(
      fixture.votes.map((v) =>
        client.models.Interest.create(
          {
            id: `${trip.id}:${destIdByName[v.destination]}:${v.memberName}`,
            tripId: trip.id,
            destinationId: destIdByName[v.destination],
            memberName: v.memberName,
            level: v.level,
          },
          EDITOR_WRITE,
        ),
      ),
    );
    console.log(
      `Seeded trip ${fixture.slug}: ${fixture.members.length} members, ${fixture.destinations.length} destinations, ${fixture.votes.length} votes.`,
    );
  }
}
