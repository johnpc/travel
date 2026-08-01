import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayCell } from './DayCell';

describe('DayCell', () => {
  it('renders a blank inert cell for a null date', () => {
    const { container } = render(<DayCell date={null} tally={undefined} mine={null} canMark onTap={vi.fn()} />); // prettier-ignore
    expect(container.querySelector('.cal__cell--blank')).toBeInTheDocument();
  });

  it('shows the day number and group free-count, and toggles on click', () => {
    const onTap = vi.fn();
    render(
      <DayCell
        date="2027-03-05"
        tally={{ free: 3, maybe: 0, busy: 0, score: 3 }}
        mine="FREE"
        canMark
        onTap={onTap}
      />,
    );
    expect(screen.getByTestId('day-2027-03-05')).toHaveTextContent('5');
    expect(screen.getByTestId('free-2027-03-05')).toHaveTextContent('3');
    fireEvent.click(screen.getByTestId('day-2027-03-05'));
    expect(onTap).toHaveBeenCalledWith('2027-03-05');
  });

  it('reflects my status via data-mine and disables when I cannot mark', () => {
    render(
      <DayCell date="2027-03-05" tally={undefined} mine="BUSY" canMark={false} onTap={vi.fn()} />,
    );
    const cell = screen.getByTestId('day-2027-03-05');
    expect(cell).toHaveAttribute('data-mine', 'BUSY');
    expect(cell).toBeDisabled();
  });
});
