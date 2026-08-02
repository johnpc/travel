import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const present = vi.hoisted(() => vi.fn());
vi.mock('@ionic/react', () => ({ useIonAlert: () => [present, vi.fn()] }));

import { useConfirmRemove } from './useConfirmRemove';

describe('useConfirmRemove', () => {
  it('is a no-op when onRemove is undefined', () => {
    present.mockClear();
    const { result } = renderHook(() => useConfirmRemove('activity', 'Hike', undefined));
    result.current();
    expect(present).not.toHaveBeenCalled();
  });

  it('presents a branded confirm whose Remove button fires onRemove', () => {
    present.mockClear();
    const onRemove = vi.fn();
    const { result } = renderHook(() => useConfirmRemove('destination', 'Rome', onRemove));
    result.current();
    const cfg = present.mock.calls.at(-1)?.[0];
    expect(cfg.header).toBe('Remove this destination?');
    expect(cfg.message).toContain('Rome');
    expect(cfg.message).toContain('board'); // destination → board
    expect(cfg.buttons.find((b: { text: string }) => b.text === 'Keep it').role).toBe('cancel');
    cfg.buttons.find((b: { text: string }) => b.text === 'Remove').handler();
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('phrases the message as a list for activities', () => {
    present.mockClear();
    const { result } = renderHook(() => useConfirmRemove('activity', 'Wine tour', vi.fn()));
    result.current();
    expect(present.mock.calls.at(-1)?.[0].message).toContain('list');
  });
});
