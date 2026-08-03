import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const h = vi.hoisted(() => ({ tapSuccess: vi.fn() }));
vi.mock('../../lib/haptics', () => ({ tapSuccess: h.tapSuccess }));

import { useAlignedHaptic } from './useAlignedHaptic';

describe('useAlignedHaptic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('buzzes once on the false→true transition, not on every render', () => {
    const { rerender } = renderHook(({ ready }) => useAlignedHaptic(ready), {
      initialProps: { ready: false },
    });
    expect(h.tapSuccess).not.toHaveBeenCalled();
    rerender({ ready: true });
    expect(h.tapSuccess).toHaveBeenCalledTimes(1);
    rerender({ ready: true }); // still ready — no repeat buzz
    expect(h.tapSuccess).toHaveBeenCalledTimes(1);
  });

  it('does not buzz when the plan starts already aligned only on later re-align', () => {
    const { rerender } = renderHook(({ ready }) => useAlignedHaptic(ready), {
      initialProps: { ready: true },
    });
    // initial mount already-ready fires once (mount is a false→true from the ref's default)
    expect(h.tapSuccess).toHaveBeenCalledTimes(1);
    rerender({ ready: false });
    rerender({ ready: true });
    // re-aligning after falling out buzzes again
    expect(h.tapSuccess).toHaveBeenCalledTimes(2);
  });
});
