/**
 * Budget server state via react-query. One shared estimate per destination —
 * the row id IS the destinationId, so any collaborator's save UPSERTS the same
 * estimate. Guest CRUD.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dataClient, unwrap, type BudgetEstimateRecord } from '../../lib/dataClient';

export interface BudgetFields {
  flightPerPerson?: number | null;
  lodgingPerNight?: number | null;
  nights?: number | null;
  seasonNote?: string | null;
}

/** The single estimate for a destination, or null if none yet. */
export async function fetchBudget(destinationId: string): Promise<BudgetEstimateRecord | null> {
  return unwrap(await dataClient.models.BudgetEstimate.get({ id: destinationId }));
}

export const budgetKeys = {
  byDestination: (destinationId: string) => ['budget', destinationId] as const,
};

/** Read a destination's estimate. `enabled` defers until expanded/known. */
export function useBudget(destinationId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: budgetKeys.byDestination(destinationId ?? ''),
    queryFn: () => fetchBudget(destinationId as string),
    enabled: !!destinationId && enabled,
  });
}

/** Upsert the shared estimate for a destination, then refresh it. */
export function useSaveBudget(tripId: string | undefined, destinationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fields: BudgetFields): Promise<void> => {
      if (!tripId || !destinationId) throw new Error('No destination to budget for');
      const payload = { id: destinationId, tripId, destinationId, ...fields };
      const created = await dataClient.models.BudgetEstimate.create(payload);
      if (created.errors?.length) unwrap(await dataClient.models.BudgetEstimate.update(payload));
    },
    onSuccess: () => {
      if (destinationId)
        qc.invalidateQueries({ queryKey: budgetKeys.byDestination(destinationId) });
    },
  });
}
