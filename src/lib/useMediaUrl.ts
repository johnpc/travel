import { useQuery } from '@tanstack/react-query';
import { getUrl } from 'aws-amplify/storage';

const URL_TTL_SECONDS = 3600; // presigned-URL lifetime

async function resolveUrl(path: string): Promise<string> {
  const { url } = await getUrl({
    path,
    options: { validateObjectExistence: false, expiresIn: URL_TTL_SECONDS },
  });
  return url.toString();
}

/**
 * Resolve an S3 media key to a presigned URL (null if no key). Cached until
 * shortly before expiry so re-renders don't re-mint the URL.
 */
export function useMediaUrl(path: string | null | undefined): string | null {
  const query = useQuery({
    queryKey: ['media-url', path],
    queryFn: () => resolveUrl(path as string),
    enabled: !!path,
    staleTime: (URL_TTL_SECONDS - 300) * 1000,
    gcTime: URL_TTL_SECONDS * 1000,
  });
  return query.data ?? null;
}
