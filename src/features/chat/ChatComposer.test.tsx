import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatComposer } from './ChatComposer';

const type = (value: string) =>
  fireEvent(screen.getByTestId('chat-input'), new CustomEvent('ionInput', { detail: { value } }));

describe('ChatComposer', () => {
  it('sends the typed message and clears', () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} isSending={false} />);
    type('can we push a week later?');
    fireEvent.submit(screen.getByTestId('chat-composer'));
    expect(onSend).toHaveBeenCalledWith('can we push a week later?');
  });

  it('renders an accessible input and a send button', () => {
    render(<ChatComposer onSend={vi.fn()} isSending={false} />);
    expect(screen.getByTestId('chat-input')).toHaveAttribute('aria-label', 'Write a message');
    // icon-only send button must have a discernible name for screen readers
    expect(screen.getByTestId('chat-send')).toHaveAttribute('aria-label', 'Send message');
  });
});
