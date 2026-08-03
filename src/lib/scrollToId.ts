/**
 * Smooth-scroll to an element by id — but honor `prefers-reduced-motion`.
 *
 * A hardcoded `scrollIntoView({ behavior: 'smooth' })` OVERRIDES the CSS
 * `scroll-behavior: auto` reduced-motion reset (the JS option wins over CSS), so
 * a motion-sensitive user still gets an animated jump. Reading the media query
 * here keeps interaction-triggered scrolling suppressible (WCAG 2.3.3).
 */
export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
