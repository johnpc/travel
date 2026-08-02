import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const h = vi.hoisted(() => ({
  useMessages: vi.fn(),
  usePostMessage: vi.fn(),
  useRemoveMessage: vi.fn(),
  post: vi.fn(),
  remove: vi.fn(),
}));
vi.mock('./chatApi', () => ({
  useMessages: h.useMessages,
  usePostMessage: h.usePostMessage,
  useRemoveMessage: h.useRemoveMessage,
}));

import { useChatPanel } from './useChatPanel';

describe('useChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useMessages.mockReturnValue({ data: [{ id: 'm1', body: 'hi' }], isLoading: false, isError: false, refetch: vi.fn() }); // prettier-ignore
    h.usePostMessage.mockReturnValue({ mutate: h.post, isPending: false });
    h.useRemoveMessage.mockReturnValue({ mutate: h.remove });
  });

  it('sends a message as the current identity', () => {
    const { result } = renderHook(() => useChatPanel('t1', 'Alex'));
    act(() => result.current.send('lets do Santorini'));
    expect(h.post).toHaveBeenCalledWith({ authorName: 'Alex', body: 'lets do Santorini' });
  });

  it('does not send without an identity', () => {
    const { result } = renderHook(() => useChatPanel('t1', null));
    act(() => result.current.send('hi'));
    expect(h.post).not.toHaveBeenCalled();
  });

  it('does not send a blank message', () => {
    const { result } = renderHook(() => useChatPanel('t1', 'Alex'));
    act(() => result.current.send('   '));
    expect(h.post).not.toHaveBeenCalled();
  });

  it('removes a message by id', () => {
    const { result } = renderHook(() => useChatPanel('t1', 'Alex'));
    act(() => result.current.remove('m1'));
    expect(h.remove).toHaveBeenCalledWith('m1');
  });
});
