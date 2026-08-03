import { useMutation } from '@tanstack/react-query';
import { dataClient, unwrap, type DestinationRecord } from '../../lib/dataClient';

/**
 * Generate a representative image for a destination via the guest-callable
 * resolver (Bedrock → S3 → persists imagePath on the row). Returns the mutation;
 * its `data` is the new imagePath, which the card renders immediately. The live
 * query doesn't observe the Lambda's out-of-band DynamoDB write, so the returned
 * path — not a query refresh — is what makes the fresh image appear this session.
 */
export function useDestinationImage(_tripId: string | undefined, destination: DestinationRecord) {
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
  });
}
