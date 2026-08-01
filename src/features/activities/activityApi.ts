/**
 * Activity server state via react-query. Activities are things to do at a
 * destination — AI-suggested or hand-added. Read by destinationId; guest CRUD.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataClient, unwrap, type ActivityRecord } from '../../lib/dataClient';
import { useLiveQuery } from '../../lib/useLiveQuery';

const byNewest = (a: ActivityRecord, b: ActivityRecord) =>
  (b.createdAt ?? '').localeCompare(a.createdAt ?? '');

export interface NewActivity {
  title: string;
  blurb?: string;
  category?: string;
  source: 'MANUAL' | 'AI';
}

/** All activities for a destination, newest first. */
export async function fetchActivities(destinationId: string): Promise<ActivityRecord[]> {
  const rows = unwrap(
    await dataClient.models.Activity.list({ filter: { destinationId: { eq: destinationId } } }),
  );
  return [...rows].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

export const activityKeys = {
  byDestination: (destinationId: string) => ['activities', destinationId] as const,
};

/** Live-read a destination's activities (observeQuery). `enabled` defers until
 * expanded + the id is known. */
export function useActivities(destinationId: string | undefined, enabled = true) {
  return useLiveQuery(
    dataClient.models.Activity,
    { destinationId: { eq: destinationId } },
    byNewest,
    !!destinationId && enabled,
  );
}

/** Add an activity to a destination, then refresh its list. */
export function useAddActivity(tripId: string | undefined, destinationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (act: NewActivity): Promise<ActivityRecord> => {
      if (!tripId || !destinationId) throw new Error('No destination to add an activity to');
      const created = unwrap(
        await dataClient.models.Activity.create({
          tripId,
          destinationId,
          title: act.title.trim(),
          blurb: act.blurb,
          category: act.category,
          source: act.source,
        }),
      );
      if (!created) throw new Error('Activity creation returned no record');
      return created;
    },
    onSuccess: () => {
      if (destinationId)
        qc.invalidateQueries({ queryKey: activityKeys.byDestination(destinationId) });
    },
  });
}
