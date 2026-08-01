import { useState } from 'react';
import { useActivities, useAddActivity } from './activityApi';
import { useSuggestActivities, type ActivitySuggestion } from './suggestActivityApi';
import type { ActivityRecord } from '../../lib/dataClient';

/**
 * Per-destination activities orchestration. Lazily fetches the destination's
 * activities only once expanded (so the board stays cheap), lets anyone add one
 * by hand, and suggests more with AI — accepting a suggestion adds it as an
 * AI-sourced Activity and drops it from the pending list.
 */
export function useActivitiesPanel(
  tripId: string | undefined,
  destinationId: string,
  destinationName: string,
  expanded: boolean,
) {
  const listQuery = useActivities(destinationId, expanded);
  const activities: ActivityRecord[] = listQuery.data ?? [];
  const addActivity = useAddActivity(tripId, destinationId);
  const suggest = useSuggestActivities();
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);

  const runSuggest = async () => {
    const exclude = activities.map((a) => a.title);
    setSuggestions(await suggest.mutateAsync({ destinationName, exclude }));
  };

  const accept = (s: ActivitySuggestion) => {
    addActivity.mutate({ title: s.title, blurb: s.blurb, category: s.category, source: 'AI' });
    setSuggestions((prev) => prev.filter((x) => x.title !== s.title));
  };

  return {
    activities,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: () => listQuery.refetch(),
    suggestions,
    isSuggesting: suggest.isPending,
    runSuggest,
    accept,
  };
}
