import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const present = vi.hoisted(() => vi.fn());
vi.mock('@ionic/react', () => ({ IonIcon: () => null, useIonAlert: () => [present, vi.fn()] }));

import { MessageBubble } from './MessageBubble';
import type { MessageRecord } from '../../lib/dataClient';

const msg = { id: 'm1', authorName: 'Priya', body: 'In for Santorini!' } as MessageRecord;

describe('MessageBubble', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows another person's author name + body, no remove", () => {
    render(<MessageBubble message={msg} mine={false} onRemove={vi.fn()} />);
    expect(screen.getByText('Priya')).toBeInTheDocument();
    expect(screen.getByText('In for Santorini!')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-remove')).not.toBeInTheDocument();
  });

  it('hides the author on your own message and offers a remove', () => {
    render(<MessageBubble message={msg} mine={true} onRemove={vi.fn()} />);
    expect(screen.queryByText('Priya')).not.toBeInTheDocument();
    expect(screen.getByTestId('chat-remove')).toBeInTheDocument();
  });

  it('confirms before removing your own message', () => {
    render(<MessageBubble message={msg} mine={true} onRemove={vi.fn()} />);
    fireEvent.click(screen.getByTestId('chat-remove'));
    expect(present).toHaveBeenCalled();
    expect(present.mock.calls.at(-1)?.[0].header).toBe('Remove this message?');
  });
});
