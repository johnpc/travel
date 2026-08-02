import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useEnsureTrip, useTrip } from './tripApi';
import { useMembers } from './memberApi';
import { recordRecent } from '../home/recentsStore';

interface TripLocationState {
  title?: string;
}

/**
 * TripPage orchestration: read the slug from the URL, ensure the trip exists
 * (create-on-first-visit, carrying any title passed from Home), then expose the
 * trip + its roster with unified load/error/empty flags for LoadState.
 */
export function useTripPage() {
  const { slug } = useParams<{ slug: string }>();
  const { state } = useLocation<TripLocationState | undefined>();
  const ensure = useEnsureTrip();
  const tripQuery = useTrip(slug);
  const trip = tripQuery.data ?? null;
  const membersQuery = useMembers(trip?.id);

  // On first visit to a slug with no trip yet, create it (using the title the
  // Home screen passed along, if any). Runs once per slug once the read settles.
  useEffect(() => {
    if (tripQuery.isSuccess && !tripQuery.data && !ensure.isPending && !ensure.isSuccess) {
      ensure.mutate({ slug, title: state?.title });
    }
  }, [tripQuery.isSuccess, tripQuery.data, ensure, slug, state]);

  // Remember this trip on the device so Home can offer a "jump back in" list —
  // the account-free safety net against losing the URL by closing the tab.
  useEffect(() => {
    if (trip?.title) recordRecent({ slug, title: trip.title }, window.localStorage);
  }, [slug, trip?.title]);

  return {
    slug,
    trip,
    members: membersQuery.data ?? [],
    isLoading: tripQuery.isLoading || ensure.isPending || (!!trip && membersQuery.isLoading),
    isError: tripQuery.isError || ensure.isError || membersQuery.isError,
    refetch: () => {
      tripQuery.refetch();
      membersQuery.refetch();
    },
  };
}
