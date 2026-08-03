import { useCallback, useState } from 'react';

interface ShareData {
  title?: string;
  text?: string;
  url: string;
}

/**
 * Share the current trip: use the native share sheet when available (mobile),
 * passing a title + inviting text alongside the URL so the recipient sees
 * "Greece 2027 — help plan our trip", not a bare link. Else copy the link and
 * flash a "Copied!" state. The trip URL is the whole identity of a trip, so
 * sharing it is step one.
 */
export function useShare(data: ShareData) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share(data);
        return;
      } catch {
        /* user dismissed or share failed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — nothing more we can do */
    }
  }, [data]);

  return { share, copied };
}
