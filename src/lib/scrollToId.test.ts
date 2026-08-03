import { describe, it, expect, vi, afterEach } from 'vitest';
import { scrollToId } from './scrollToId';

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: reduce }) as unknown as typeof window.matchMedia;
}

describe('scrollToId', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('smooth-scrolls to the section top by default', () => {
    mockReducedMotion(false);
    const el = document.createElement('div');
    el.id = 'target';
    const spy = vi.fn();
    el.scrollIntoView = spy;
    document.body.appendChild(el);
    scrollToId('target');
    expect(spy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('uses an instant (auto) jump when the user prefers reduced motion', () => {
    mockReducedMotion(true);
    const el = document.createElement('div');
    el.id = 'target';
    const spy = vi.fn();
    el.scrollIntoView = spy;
    document.body.appendChild(el);
    scrollToId('target');
    expect(spy).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
  });

  it('is a no-op when the id is missing', () => {
    mockReducedMotion(false);
    expect(() => scrollToId('nope')).not.toThrow();
  });
});
