import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const h = vi.hoisted(() => ({ useDestinationsPanel: vi.fn() }));
vi.mock('./useDestinationsPanel', () => ({ useDestinationsPanel: h.useDestinationsPanel }));
vi.mock('../activities/ActivitiesSection', () => ({
  ActivitiesSection: () => <div data-testid="activities" />,
}));
vi.mock('../budget/BudgetSection', () => ({ BudgetSection: () => <div data-testid="budget" /> }));

import { DestinationsPanel } from './DestinationsPanel';
import type { DestinationRecord } from '../../lib/dataClient';

const interest = {
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  tallies: {},
  levelFor: () => null,
  cast: vi.fn(),
  isVoting: false,
  canVote: false,
};

const base = {
  destinations: [] as DestinationRecord[],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  isAdding: false,
  addManual: vi.fn(),
  suggestions: [],
  isSuggesting: false,
  runSuggest: vi.fn(),
  accept: vi.fn(),
  interest,
};

describe('DestinationsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the empty state when there are no destinations', () => {
    h.useDestinationsPanel.mockReturnValue({ ...base });
    render(<DestinationsPanel tripId="t1" tripTitle="Trip" me={null} />);
    expect(screen.getByTestId('load-empty')).toHaveTextContent('No destinations yet');
    expect(screen.getByTestId('suggest-btn')).toBeInTheDocument();
  });

  it('renders the board with a vote control per destination', () => {
    h.useDestinationsPanel.mockReturnValue({
      ...base,
      destinations: [{ id: '1', name: 'Rome', source: 'MANUAL' }] as DestinationRecord[],
    });
    render(<DestinationsPanel tripId="t1" tripTitle="Trip" me="Alex" />);
    expect(screen.getByTestId('dest-list')).toBeInTheDocument();
    expect(screen.getByText('Rome')).toBeInTheDocument();
    expect(screen.getByTestId('vote-control')).toBeInTheDocument();
  });

  it('shows a retry on error', () => {
    h.useDestinationsPanel.mockReturnValue({ ...base, isError: true });
    render(<DestinationsPanel tripId="t1" tripTitle="Trip" me={null} />);
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
  });
});
