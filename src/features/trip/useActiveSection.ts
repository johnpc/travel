import { useEffect, useState } from 'react';

/**
 * Scroll-spy: track which of the given section ids is currently in view so the
 * section-nav can highlight it ("you are here" + confirms a jump landed). Uses
 * IntersectionObserver with a top root-margin so the active section flips as it
 * reaches the area just under the sticky nav, not only when it hits the top.
 */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;

    // Track intersection ratios; the top-most sufficiently-visible section wins.
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        const visible = ids.filter((id) => (ratios.get(id) ?? 0) > 0);
        if (visible.length) setActive(visible[0]);
      },
      // Offset the top by the sticky nav so a section counts as "current" once it
      // clears the bar; threshold steps let ratio changes fire.
      { rootMargin: '-80px 0px -55% 0px', threshold: [0, 0.1, 0.5, 1] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
