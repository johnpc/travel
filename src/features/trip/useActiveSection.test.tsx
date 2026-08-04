import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActiveSection } from './useActiveSection';

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

/** Stub getElementById so each section reports a fixed top edge (relative to the
 * 80px nav line), then fire a scroll so the hook recomputes from those rects. */
function layout(tops: Record<string, number>) {
  vi.spyOn(document, 'getElementById').mockImplementation((id: string) =>
    id in tops
      ? ({
          getBoundingClientRect: () => ({ top: tops[id], bottom: tops[id] + 100 }),
        } as HTMLElement)
      : null,
  );
}

describe('useActiveSection', () => {
  it('highlights the topmost section sitting at/just below the sticky nav', () => {
    // crew has scrolled above the nav (top 42 < 80); dates is parked just under
    // it (242) — the section you actually jumped to — so dates wins, not crew.
    layout({ 'trip-crew': 42, 'trip-destinations': -1700, 'trip-dates': 242, 'trip-chat': 900 });
    const { result } = renderHook(() =>
      useActiveSection(['trip-crew', 'trip-destinations', 'trip-dates', 'trip-chat']),
    );
    act(() => window.dispatchEvent(new Event('resize')));
    expect(result.current).toBe('trip-dates');
  });

  it('prefers the section nearest below the nav over a taller neighbor', () => {
    // The roster (crew, top 200) is short; the calendar (dates, top 400) is tall.
    // A "max visible area" rule would pick dates, but crew is the one under the
    // nav after its jump — anchoring on heading position picks crew.
    layout({ 'trip-crew': 200, 'trip-destinations': -1600, 'trip-dates': 400, 'trip-chat': 1200 });
    const { result } = renderHook(() =>
      useActiveSection(['trip-crew', 'trip-destinations', 'trip-dates', 'trip-chat']),
    );
    act(() => window.dispatchEvent(new Event('resize')));
    expect(result.current).toBe('trip-crew');
  });

  it('falls back to the last section above the nav at the bottom of the page', () => {
    // Everything has scrolled above the nav line (all tops < 80) — the last one
    // (chat, greatest top) is what you're viewing at the page bottom.
    layout({ 'trip-crew': -900, 'trip-destinations': -600, 'trip-dates': -300, 'trip-chat': -40 });
    const { result } = renderHook(() =>
      useActiveSection(['trip-crew', 'trip-destinations', 'trip-dates', 'trip-chat']),
    );
    act(() => window.dispatchEvent(new Event('resize')));
    expect(result.current).toBe('trip-chat');
  });
});
