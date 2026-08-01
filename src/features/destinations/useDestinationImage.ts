import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataClient, unwrap, type DestinationRecord } from '../../lib/dataClient';
import { destinationKeys } from './destinationApi';

/**
 * Generate a representative image for a destination via the guest-callable
 * resolver (Bedrock → S3 → persists imagePath on the row). On success, refresh
 * the trip's destinations so the new image shows. Returns the mutation so the
 * card can show a generating state.
 */
export function useDestinationImage(tripId: string | undefined, destination: DestinationRecord) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const result = await dataClient.mutations.generateDestinationImage({
        destinationId: destination.id,
        name: destination.name,
        blurb: destination.blurb,
      });
      const data = unwrap(result);
      if (!data?.imagePath) throw new Error('Image generation returned no path');
      return data.imagePath;
    },
    onSuccess: () => {
      if (tripId) qc.invalidateQueries({ queryKey: destinationKeys.byTrip(tripId) });
    },
  });
}
