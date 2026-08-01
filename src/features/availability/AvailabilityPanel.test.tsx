import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({ useAvailabilityPanel: vi.fn() }));
vi.mock('./useAvailabilityPanel', () => ({ useAvailabilityPanel: h.useAvailabilityPanel }));

import { AvailabilityPanel } from './AvailabilityPanel';
import { monthGrid } from './calendar';

const base = {
  year: 2027,
  month: 6,
  weeks: monthGrid(2027, 6),
  tallies: {},
  windows: [{ start: '2027-06-12', end: '2027-06-18', days: 7, minFree: 3, maxFree: 4 }],
  statusFor: () => null,
  inRange: () => false,
  rangeStart: null,
  pickRange: vi.fn(),
  toggle: vi.fn(),
  jumpTo: vi.fn(),
  prevMonth: vi.fn(),
  nextMonth: vi.fn(),
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  canMark: true,
};

describe('AvailabilityPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the month title, candidate windows, and a grid', () => {
    h.useAvailabilityPanel.mockReturnValue({ ...base });
    render(<AvailabilityPanel tripId="t1" me="Alex" start={{ year: 2027, month: 6 }} />);
    expect(screen.getByTestId('cal-title')).toHaveTextContent('June 2027');
    expect(screen.getByTestId('candidate-window')).toHaveTextContent('Jun 12–18, 2027');
    expect(screen.getByTestId('day-2027-06-01')).toBeInTheDocument();
  });

  it('jumps to a window when tapped', () => {
    const jumpTo = vi.fn();
    h.useAvailabilityPanel.mockReturnValue({ ...base, jumpTo });
    render(<AvailabilityPanel tripId="t1" me="Alex" start={{ year: 2027, month: 6 }} />);
    fireEvent.click(screen.getByTestId('candidate-window'));
    expect(jumpTo).toHaveBeenCalledWith(base.windows[0]);
  });

  it('range mode taps pick a range; single mode taps toggle', () => {
    const pickRange = vi.fn();
    const toggle = vi.fn();
    h.useAvailabilityPanel.mockReturnValue({ ...base, pickRange, toggle });
    render(<AvailabilityPanel tripId="t1" me="Alex" start={{ year: 2027, month: 6 }} />);
    // default is range mode
    fireEvent.click(screen.getByTestId('day-2027-06-10'));
    expect(pickRange).toHaveBeenCalledWith('2027-06-10');
    // switch to single-day mode
    fireEvent.click(screen.getByTestId('mode-single'));
    fireEvent.click(screen.getByTestId('day-2027-06-11'));
    expect(toggle).toHaveBeenCalledWith('2027-06-11');
  });

  it('nudges the visitor to pick a name when they have no identity', () => {
    h.useAvailabilityPanel.mockReturnValue({ ...base, canMark: false });
    render(<AvailabilityPanel tripId="t1" me={null} start={{ year: 2027, month: 6 }} />);
    expect(screen.getByText(/Pick your name/)).toBeInTheDocument();
  });

  it('shows a retry on error', () => {
    h.useAvailabilityPanel.mockReturnValue({ ...base, isError: true });
    render(<AvailabilityPanel tripId="t1" me="Alex" start={{ year: 2027, month: 6 }} />);
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
  });
});
