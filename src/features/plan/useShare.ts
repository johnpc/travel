import { useCallback, useState } from 'react';

/**
 * Share the current trip URL: use the native share sheet when available
 * (mobile), else copy the link to the clipboard and flash a "Copied!" state.
 * The trip URL is the whole identity of a trip, so sharing it is step one.
 */
export function useShare(url: string) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const nav = navigator as Navigator & { share?: (data: { url: string }) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ url });
        return;
      } catch {
        /* user dismissed or share failed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — nothing more we can do */
    }
  }, [url]);

  return { share, copied };
}
