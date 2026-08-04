import { useEffect, useState } from 'react';

/** Height of the sticky section-nav — the "current" section is whichever fills
 * the viewport just below this line. */
const NAV_OFFSET = 80;

/** The active section is the one whose heading sits just under the sticky nav —
 * i.e. the topmost section whose top edge hasn't yet scrolled ABOVE the nav line
 * (top ≥ offset − tolerance). A "max visible area" rule looks tempting but a
 * short section (the roster) loses to a tall neighbor (the calendar) even when
 * it's the one parked under the nav; anchoring on the heading position matches
 * where a jump actually lands. Falls back to the last section above the line
 * (bottom of page, nothing sitting below the nav). */
function currentSection(ids: string[]): string | null {
  if (typeof window === 'undefined') return null;
  const TOL = 8; // a heading pinned right at the nav line counts as "below"
  let below: string | null = null;
  let belowTop = Infinity;
  let above: string | null = null;
  let aboveTop = -Infinity;
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    if (top >= NAV_OFFSET - TOL) {
      if (top < belowTop) {
        belowTop = top;
        below = id;
      }
    } else if (top > aboveTop) {
      aboveTop = top;
      above = id;
    }
  }
  return below ?? above;
}

/** Ionic scrolls inside ion-content's shadow `.inner-scroll`, whose native
 * scroll events don't cross the shadow boundary to document — so listen on it
 * directly. Falls back to window for a plain (non-Ionic) scroll container. */
function scrollTarget(): EventTarget {
  const inner = document.querySelector('ion-content')?.shadowRoot?.querySelector('.inner-scroll');
  return inner ?? window;
}

/**
 * Scroll-spy: track which of the given section ids fills the viewport below the
 * sticky nav so the section-nav can highlight it ("you are here" + confirms a
 * jump landed). Recomputes on scroll (throttled with rAF), reading live rects so
 * it stays correct after a programmatic jump — an IntersectionObserver alone
 * goes stale there (it only fires on threshold crossings, missing the settle).
 */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let raf = 0;
    const update = () => {
      raf = 0;
      setActive(currentSection(ids));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // A jump's scroll animation settles a frame or two after the click; the
    // scroll listener catches every tick including the last, so no stale state.
    const target = scrollTarget();
    update();
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids]);

  return active;
}
