import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoteControl } from './VoteControl';

const tally = { yes: 2, maybe: 1, no: 0, score: 3 };

describe('VoteControl', () => {
  it('shows the tally + a consensus bar and fires onVote with the chosen level', () => {
    const onVote = vi.fn();
    render(<VoteControl tally={tally} myLevel={null} canVote onVote={onVote} />);
    expect(screen.getByTestId('vote-tally')).toHaveTextContent('2 in · 1 maybe · 0 pass');
    expect(screen.getByTestId('vote-bar')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('vote-YES'));
    expect(onVote).toHaveBeenCalledWith('YES');
  });

  it('hides the consensus bar when nobody has voted yet', () => {
    render(
      <VoteControl
        tally={{ yes: 0, maybe: 0, no: 0, score: 0 }}
        myLevel={null}
        canVote

        onVote={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('vote-bar')).not.toBeInTheDocument();
  });

  it('shows "N of M voted" when the roster size is known', () => {
    // 2 in + 1 maybe + 0 pass = 3 of 4 voted
    render(
      <VoteControl tally={tally} myLevel={null} canVote onVote={vi.fn()} memberCount={4} />, // prettier-ignore
    );
    expect(screen.getByTestId('vote-tally')).toHaveTextContent('3 of 4 voted');
  });

  it('omits the "N of M voted" when the roster size is unknown', () => {
    render(<VoteControl tally={tally} myLevel={null} canVote onVote={vi.fn()} />);
    expect(screen.getByTestId('vote-tally')).not.toHaveTextContent('voted');
  });

  it('marks my current pick as pressed', () => {
    render(<VoteControl tally={tally} myLevel="MAYBE" canVote onVote={vi.fn()} />);
    expect(screen.getByTestId('vote-MAYBE')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('vote-YES')).toHaveAttribute('aria-pressed', 'false');
  });

  it('optimistically presses the tapped button instantly (before myLevel updates)', () => {
    // myLevel stays null (server hasn't echoed yet) but the tapped button lights up.
    render(<VoteControl tally={tally} myLevel={null} canVote onVote={vi.fn()} />);
    fireEvent.click(screen.getByTestId('vote-YES'));
    expect(screen.getByTestId('vote-YES')).toHaveAttribute('aria-pressed', 'true');
  });

  it('disables the buttons when the visitor has no identity', () => {
    render(<VoteControl tally={tally} myLevel={null} canVote={false} onVote={vi.fn()} />);
    expect(screen.getByTestId('vote-YES')).toBeDisabled();
  });
});
