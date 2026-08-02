import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ create: vi.fn(), delete: vi.fn(), observeQuery: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return {
    ...actual,
    dataClient: {
      models: { Message: { create: m.create, delete: m.delete, observeQuery: m.observeQuery } },
    },
  };
});

function liveWith(items: unknown[]) {
  m.observeQuery.mockReturnValue({
    subscribe: (h: { next: (msg: { items: unknown[]; isSynced: boolean }) => void }) => {
      h.next({ items, isSynced: true });
      return { unsubscribe: vi.fn() };
    },
  });
}

import { useMessages, usePostMessage, useRemoveMessage } from './chatApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('does not subscribe until a trip id is known', () => {
    renderHook(() => useMessages(undefined), { wrapper });
    expect(m.observeQuery).not.toHaveBeenCalled();
  });
  it('live-reads the thread oldest first', async () => {
    liveWith([
      { id: '2', body: 'later', createdAt: '2026-02-01' },
      { id: '1', body: 'first', createdAt: '2026-01-01' },
    ]);
    const { result } = renderHook(() => useMessages('t1'), { wrapper });
    await waitFor(() => expect(result.current.data?.[0]?.body).toBe('first'));
  });
});

describe('usePostMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('creates a trimmed message for the author', async () => {
    m.create.mockResolvedValue({ data: { id: 'x' } });
    const { result } = renderHook(() => usePostMessage('t1'), { wrapper });
    await result.current.mutateAsync({ authorName: 'Alex', body: '  hi crew  ' });
    expect(m.create).toHaveBeenCalledWith({ tripId: 't1', authorName: 'Alex', body: 'hi crew' });
  });
  it('skips creating an empty (whitespace) message', async () => {
    const { result } = renderHook(() => usePostMessage('t1'), { wrapper });
    await result.current.mutateAsync({ authorName: 'Alex', body: '   ' });
    expect(m.create).not.toHaveBeenCalled();
  });
  it('rejects when there is no trip', async () => {
    const { result } = renderHook(() => usePostMessage(undefined), { wrapper });
    await expect(result.current.mutateAsync({ authorName: 'A', body: 'x' })).rejects.toThrow('No trip'); // prettier-ignore
  });
});

describe('useRemoveMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('deletes the message by id', async () => {
    m.delete.mockResolvedValue({ data: { id: 'm1' } });
    const { result } = renderHook(() => useRemoveMessage('t1'), { wrapper });
    await result.current.mutateAsync('m1');
    expect(m.delete).toHaveBeenCalledWith({ id: 'm1' });
  });
});
