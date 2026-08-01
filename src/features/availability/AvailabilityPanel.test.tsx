import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const h = vi.hoisted(() => ({ useAvailabilityPanel: vi.fn() }));
vi.mock('./useAvailabilityPanel', () => ({ useAvailabilityPanel: h.useAvailabilityPanel }));

import { AvailabilityPanel } from './AvailabilityPanel';
import { monthGrid } from './calendar';

const base = {
  year: 2027,
  month: 3,
  weeks: monthGrid(2027, 3),
  tallies: {},
  statusFor: () => null,
  toggle: vi.fn(),
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

  it('renders the month title and a grid of days', () => {
    h.useAvailabilityPanel.mockReturnValue({ ...base });
    render(<AvailabilityPanel tripId="t1" me="Alex" start={{ year: 2027, month: 3 }} />);
    expect(screen.getByTestId('cal-title')).toHaveTextContent('March 2027');
    expect(screen.getByTestId('day-2027-03-01')).toBeInTheDocument();
  });

  it('nudges the visitor to pick a name when they have no identity', () => {
    h.useAvailabilityPanel.mockReturnValue({ ...base, canMark: false });
    render(<AvailabilityPanel tripId="t1" me={null} start={{ year: 2027, month: 3 }} />);
    expect(screen.getByText(/Pick your name/)).toBeInTheDocument();
  });

  it('shows a retry on error', () => {
    h.useAvailabilityPanel.mockReturnValue({ ...base, isError: true });
    render(<AvailabilityPanel tripId="t1" me="Alex" start={{ year: 2027, month: 3 }} />);
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
  });
});
