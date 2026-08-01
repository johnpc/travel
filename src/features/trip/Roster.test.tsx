import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Roster } from './Roster';
import type { MemberRecord } from '../../lib/dataClient';

const members = [
  { id: '1', name: 'Alex' },
  { id: '2', name: 'Sam' },
] as MemberRecord[];

describe('Roster', () => {
  it('renders each member as a chip and highlights me', () => {
    render(
      <Roster members={members} me="Sam" onJoin={vi.fn()} onPick={vi.fn()} isJoining={false} />,
    );
    expect(screen.getAllByTestId('roster-member')).toHaveLength(2);
    expect(screen.getByTestId('roster-you')).toHaveTextContent('Sam');
  });

  it('shows a join form when I have not picked a name, and joins', () => {
    const onJoin = vi.fn();
    render(<Roster members={members} me={null} onJoin={onJoin} onPick={vi.fn()} isJoining={false} />); // prettier-ignore
    fireEvent(
      screen.getByTestId('join-name'),
      new CustomEvent('ionInput', { detail: { value: 'Priya' } }),
    );
    fireEvent.submit(screen.getByTestId('join-form'));
    expect(onJoin).toHaveBeenCalledWith('Priya');
  });

  it('picks an existing member when their chip is tapped', () => {
    const onPick = vi.fn();
    render(<Roster members={members} me={null} onJoin={vi.fn()} onPick={onPick} isJoining={false} />); // prettier-ignore
    fireEvent.click(screen.getAllByTestId('roster-member')[0]);
    expect(onPick).toHaveBeenCalledWith('Alex');
  });
});
