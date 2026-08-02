import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const h = vi.hoisted(() => ({ useChatPanel: vi.fn() }));
vi.mock('./useChatPanel', () => ({ useChatPanel: h.useChatPanel }));

import { ChatSection } from './ChatSection';

const base = {
  messages: [],
  me: null,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  send: vi.fn(),
  isSending: false,
  remove: vi.fn(),
};

describe('ChatSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useChatPanel.mockReturnValue({ ...base });
  });

  it('gates the composer behind identity — shows a nudge when no name picked', () => {
    render(<ChatSection tripId="t1" me={null} />);
    expect(screen.getByTestId('chat-gate')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-composer')).not.toBeInTheDocument();
  });

  it('shows the composer once you have an identity', () => {
    h.useChatPanel.mockReturnValue({ ...base, me: 'Alex' });
    render(<ChatSection tripId="t1" me="Alex" />);
    expect(screen.getByTestId('chat-composer')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-gate')).not.toBeInTheDocument();
  });

  it('renders the live thread with own vs others', () => {
    h.useChatPanel.mockReturnValue({
      ...base,
      me: 'Alex',
      messages: [
        { id: '1', authorName: 'Priya', body: 'hi' },
        { id: '2', authorName: 'Alex', body: 'yo' },
      ],
    });
    render(<ChatSection tripId="t1" me="Alex" />);
    expect(screen.getAllByTestId('chat-message')).toHaveLength(2);
  });

  it('shows an empty state before any message', () => {
    render(<ChatSection tripId="t1" me="Alex" />);
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });
});
