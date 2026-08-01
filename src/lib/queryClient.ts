import { QueryClient } from '@tanstack/react-query';

/** App-wide react-query client. All server state (Amplify data) lives here.
 * A single retry + no refetch-on-focus keeps the guest collaboration snappy
 * without hammering AppSync. */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});
