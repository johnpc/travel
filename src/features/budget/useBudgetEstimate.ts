import { useState } from 'react';
import { useEstimateBudget } from './estimateBudgetApi';
import type { BudgetForm } from './useBudgetPanel';

const str = (n: number | null): string => (n == null ? '' : String(n));

/**
 * The AI-ballpark concern of the budget panel: fetch an estimate for the
 * destination and fill the EMPTY form fields (never overwriting what someone
 * typed). Catches failures so it never rejects unhandled; `error` drives a
 * retryable message. Split from useBudgetPanel to keep each unit small.
 */
export function useBudgetEstimate(
  destinationName: string,
  setForm: (updater: (f: BudgetForm) => BudgetForm) => void,
) {
  const estimate = useEstimateBudget();
  // Brief "Estimated ✓" flash after a fill — confirms the tap landed (the fields
  // changing is subtle) and reinforces these are editable AI ballparks.
  const [justEstimated, setJustEstimated] = useState(false);

  const run = async () => {
    if (!destinationName) return;
    try {
      const e = await estimate.mutateAsync({ destinationName });
      setForm((f) => ({
        flightPerPerson: f.flightPerPerson || str(e.flightPerPerson),
        lodgingPerNight: f.lodgingPerNight || str(e.lodgingPerNight),
        nights: f.nights || str(e.nights),
        seasonNote: f.seasonNote || (e.seasonNote ?? ''),
      }));
      setJustEstimated(true);
      setTimeout(() => setJustEstimated(false), 2500);
    } catch {
      /* error flag drives the retry message */
    }
  };

  return {
    run,
    isEstimating: estimate.isPending,
    estimateError: estimate.isError,
    justEstimated,
  };
}
