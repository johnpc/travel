/**
 * Upsert (or clear) one availability mark — the shared write used by both the
 * single-day toggle and the range marker. create-or-update by deterministic id;
 * a null status deletes the row. Isolated so the mutations stay thin.
 */
import { dataClient, unwrap, type AvailabilityStatus } from '../../lib/dataClient';
import { announceWrite, deleteLive } from '../../lib/liveWrites';

export async function upsertMark(
  tripId: string,
  date: string,
  memberName: string,
  status: AvailabilityStatus | null,
): Promise<void> {
  const id = `${tripId}:${date}:${memberName}`;
  if (status === null) {
    await deleteLive(dataClient.models.Availability, id, () =>
      dataClient.models.Availability.delete({ id }),
    );
    return;
  }
  const created = await dataClient.models.Availability.create({
    id,
    tripId,
    date,
    memberName,
    status,
  });
  const saved = created.errors?.length
    ? unwrap(await dataClient.models.Availability.update({ id, status }))
    : created.data;
  announceWrite(dataClient.models.Availability, saved);
}
