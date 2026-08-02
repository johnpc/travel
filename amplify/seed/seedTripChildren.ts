/** Seed one trip's child records (members, destinations, votes, availability,
 * budgets). Split out of seedTrips so each function stays small. Returns the
 * destination name→id map (votes/budgets reference destinations by name). */
import { client, EDITOR_WRITE } from './seedClient';
import type { TripFixture } from './fixtures/trips';

export async function seedMembers(tripId: string, f: TripFixture): Promise<void> {
  await Promise.all(
    f.members.map((name) => client.models.Member.create({ tripId, name }, EDITOR_WRITE)),
  );
}

export async function seedDestinations(
  tripId: string,
  f: TripFixture,
): Promise<Record<string, string>> {
  const byName: Record<string, string> = {};
  for (const d of f.destinations) {
    const { data } = await client.models.Destination.create(
      { tripId, name: d.name, blurb: d.blurb, why: d.why, source: d.source },
      EDITOR_WRITE,
    );
    if (data) byName[d.name] = data.id;
  }
  return byName;
}

export async function seedVotesAndAvailability(
  tripId: string,
  f: TripFixture,
  destId: Record<string, string>,
): Promise<void> {
  await Promise.all([
    ...f.votes.map((v) =>
      client.models.Interest.create(
        { id: `${tripId}:${destId[v.destination]}:${v.memberName}`, tripId, destinationId: destId[v.destination], memberName: v.memberName, level: v.level }, // prettier-ignore
        EDITOR_WRITE,
      ),
    ),
    ...f.availability.map((a) =>
      client.models.Availability.create(
        { id: `${tripId}:${a.date}:${a.memberName}`, tripId, date: a.date, memberName: a.memberName, status: a.status }, // prettier-ignore
        EDITOR_WRITE,
      ),
    ),
    ...f.budgets.map((bd) =>
      client.models.BudgetEstimate.create(
        { id: destId[bd.destination], tripId, destinationId: destId[bd.destination], flightPerPerson: bd.flightPerPerson, lodgingPerNight: bd.lodgingPerNight, nights: bd.nights, seasonNote: bd.seasonNote }, // prettier-ignore
        EDITOR_WRITE,
      ),
    ),
  ]);
}
