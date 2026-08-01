import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const h = vi.hoisted(() => ({ useTripPlan: vi.fn() }));
vi.mock('./useTripPlan', () => ({ useTripPlan: h.useTripPlan }));

import { TripPlan } from './TripPlan';
import type { DestinationRecord } from '../../lib/dataClient';

const frontRunner = { id: 'b', name: 'Bali' } as DestinationRecord;

describe('TripPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing until there is a front-runner', () => {
    h.useTripPlan.mockReturnValue({ isLoading: false, isError: false, frontRunner: null });
    const { container } = render(<TripPlan tripId="t1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('summarizes front-runner, best window, and budget', () => {
    h.useTripPlan.mockReturnValue({
      isLoading: false,
      isError: false,
      frontRunner,
      frontRunnerVotes: { yes: 2, maybe: 1, no: 0 },
      bestWindow: { start: '2027-06-12', end: '2027-06-18', days: 7 },
      budget: { perPerson: 900, perCouple: 1800, hasEstimate: true },
    });
    render(<TripPlan tripId="t1" />);
    expect(screen.getByTestId('plan-frontrunner')).toHaveTextContent('Bali');
    expect(screen.getByTestId('plan-dates')).toHaveTextContent("7 days everyone's free");
    expect(screen.getByTestId('plan-budget')).toHaveTextContent('$900');
  });

  it('nudges for dates + budget when they are missing', () => {
    h.useTripPlan.mockReturnValue({
      isLoading: false,
      isError: false,
      frontRunner,
      frontRunnerVotes: { yes: 0, maybe: 0, no: 0 },
      bestWindow: null,
      budget: null,
    });
    render(<TripPlan tripId="t1" />);
    expect(screen.getByTestId('plan-dates')).toHaveTextContent('Mark your dates');
    expect(screen.getByTestId('plan-budget')).toHaveTextContent('Add a budget estimate');
  });
});
