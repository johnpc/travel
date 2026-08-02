import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WelcomeJoin } from './WelcomeJoin';

const setName = (value: string) =>
  fireEvent(screen.getByTestId('welcome-join-name'), new CustomEvent('ionInput', { detail: { value } })); // prettier-ignore

describe('WelcomeJoin', () => {
  it('joins with the typed name and clears', () => {
    const onJoin = vi.fn();
    render(<WelcomeJoin onJoin={onJoin} isJoining={false} />);
    setName('Alex');
    fireEvent.submit(screen.getByTestId('welcome-join'));
    expect(onJoin).toHaveBeenCalledWith('Alex');
  });

  it('renders a labelled name field and a Join button', () => {
    render(<WelcomeJoin onJoin={vi.fn()} isJoining={false} />);
    expect(screen.getByTestId('welcome-join-name')).toBeInTheDocument();
    expect(screen.getByTestId('welcome-join-btn')).toHaveTextContent('Join');
  });
});
