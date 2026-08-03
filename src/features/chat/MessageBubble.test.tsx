import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const present = vi.hoisted(() => vi.fn());
vi.mock('@ionic/react', () => ({ IonIcon: () => null, useIonAlert: () => [present, vi.fn()] }));

import { MessageBubble } from './MessageBubble';
import type { MessageRecord } from '../../lib/dataClient';

const now = Date.parse('2027-06-01T12:00:00Z');
const msg = {
  id: 'm1',
  authorName: 'Priya',
  body: 'In for Santorini!',
  createdAt: new Date(now - 5 * 60_000).toISOString(),
} as MessageRecord;

describe('MessageBubble', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows another person's author name, when, + body, no remove", () => {
    render(<MessageBubble message={msg} mine={false} onRemove={vi.fn()} now={now} />);
    expect(screen.getByText('Priya')).toBeInTheDocument();
    expect(screen.getByText('5m')).toBeInTheDocument();
    expect(screen.getByText('In for Santorini!')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-remove')).not.toBeInTheDocument();
  });

  it('hides the author on your own message (keeps the time) and offers a remove', () => {
    render(<MessageBubble message={msg} mine={true} onRemove={vi.fn()} now={now} />);
    expect(screen.queryByText('Priya')).not.toBeInTheDocument();
    expect(screen.getByText('5m')).toBeInTheDocument();
    expect(screen.getByTestId('chat-remove')).toBeInTheDocument();
  });

  it('confirms before removing your own message', () => {
    render(<MessageBubble message={msg} mine={true} onRemove={vi.fn()} now={now} />);
    fireEvent.click(screen.getByTestId('chat-remove'));
    expect(present).toHaveBeenCalled();
    expect(present.mock.calls.at(-1)?.[0].header).toBe('Remove this message?');
  });

  it('renders a pasted URL as a safe new-tab link', () => {
    const linkMsg = { ...msg, body: 'check https://airbnb.com/x' } as MessageRecord;
    render(<MessageBubble message={linkMsg} mine={false} now={now} />);
    const link = screen.getByRole('link', { name: 'https://airbnb.com/x' });
    expect(link).toHaveAttribute('href', 'https://airbnb.com/x');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
