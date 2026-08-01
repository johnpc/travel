import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoteControl } from './VoteControl';

const tally = { yes: 2, maybe: 1, no: 0, score: 3 };

describe('VoteControl', () => {
  it('shows the tally and fires onVote with the chosen level', () => {
    const onVote = vi.fn();
    render(<VoteControl tally={tally} myLevel={null} canVote isVoting={false} onVote={onVote} />);
    expect(screen.getByTestId('vote-tally')).toHaveTextContent('2 in · 1 maybe · 0 pass');
    fireEvent.click(screen.getByTestId('vote-YES'));
    expect(onVote).toHaveBeenCalledWith('YES');
  });

  it('marks my current pick as pressed', () => {
    render(<VoteControl tally={tally} myLevel="MAYBE" canVote isVoting={false} onVote={vi.fn()} />);
    expect(screen.getByTestId('vote-MAYBE')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('vote-YES')).toHaveAttribute('aria-pressed', 'false');
  });

  it('disables the buttons when the visitor has no identity', () => {
    render(
      <VoteControl
        tally={tally}
        myLevel={null}
        canVote={false}
        isVoting={false}
        onVote={vi.fn()}
      />,
    );
    expect(screen.getByTestId('vote-YES')).toBeDisabled();
  });
});
