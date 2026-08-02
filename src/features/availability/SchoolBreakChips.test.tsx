import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SchoolBreakChips } from './SchoolBreakChips';

const breaks = [
  { label: 'Spring Break', start: '2027-03-14', end: '2027-03-21' },
  { label: 'Summer Break', start: '2027-07-06', end: '2027-07-13' },
];

describe('SchoolBreakChips', () => {
  it('renders a chip per break with its label and range', () => {
    render(<SchoolBreakChips breaks={breaks} onPick={vi.fn()} />);
    const chips = screen.getAllByTestId('school-break');
    expect(chips).toHaveLength(2);
    expect(chips[0]).toHaveTextContent('Spring Break');
    expect(chips[0]).toHaveTextContent('Mar 14–21, 2027');
  });

  it('fires onPick with the chosen break', () => {
    const onPick = vi.fn();
    render(<SchoolBreakChips breaks={breaks} onPick={onPick} />);
    fireEvent.click(screen.getAllByTestId('school-break')[1]);
    expect(onPick).toHaveBeenCalledWith(breaks[1]);
  });

  it('renders nothing when there are no breaks', () => {
    const { container } = render(<SchoolBreakChips breaks={[]} onPick={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
