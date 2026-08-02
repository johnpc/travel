import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({ useDestinationsPanel: vi.fn(), present: vi.fn() }));
vi.mock('./useDestinationsPanel', () => ({ useDestinationsPanel: h.useDestinationsPanel }));
vi.mock('@ionic/react', async (importActual) => {
  const actual = await importActual<typeof import('@ionic/react')>();
  return { ...actual, useIonAlert: () => [h.present, vi.fn()] };
});
vi.mock('../activities/ActivitiesSection', () => ({
  ActivitiesSection: () => <div data-testid="activities" />,
}));
vi.mock('../budget/BudgetSection', () => ({ BudgetSection: () => <div data-testid="budget" /> }));
vi.mock('./DestinationImage', () => ({ DestinationImage: () => <div data-testid="dest-image" /> }));

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
  remove: vi.fn(),
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

  it('removes a destination (confirmed) via the card control', () => {
    const remove = vi.fn();
    h.present.mockClear();
    h.useDestinationsPanel.mockReturnValue({
      ...base,
      remove,
      destinations: [{ id: '1', name: 'Rome', source: 'MANUAL' }] as DestinationRecord[],
    });
    render(<DestinationsPanel tripId="t1" tripTitle="Trip" me="Alex" />);
    fireEvent.click(screen.getByTestId('dest-remove'));
    // the branded confirm is presented; firing its "Remove" handler removes by id
    const cfg = h.present.mock.calls.at(-1)?.[0];
    cfg.buttons.find((btn: { text: string }) => btn.text === 'Remove').handler();
    expect(remove).toHaveBeenCalledWith('1');
  });

  it('nudges a nameless visitor to pick a name when there is a board to vote on', () => {
    h.useDestinationsPanel.mockReturnValue({
      ...base,
      destinations: [{ id: '1', name: 'Rome', source: 'MANUAL' }] as DestinationRecord[],
    });
    render(<DestinationsPanel tripId="t1" tripTitle="Trip" me={null} />);
    expect(screen.getByTestId('vote-hint')).toHaveTextContent('Pick your name above to vote');
  });

  it('does not show the vote nudge once the visitor has a name', () => {
    h.useDestinationsPanel.mockReturnValue({
      ...base,
      destinations: [{ id: '1', name: 'Rome', source: 'MANUAL' }] as DestinationRecord[],
    });
    render(<DestinationsPanel tripId="t1" tripTitle="Trip" me="Alex" />);
    expect(screen.queryByTestId('vote-hint')).not.toBeInTheDocument();
  });

  it('does not show the vote nudge on an empty trip (welcome covers onboarding)', () => {
    h.useDestinationsPanel.mockReturnValue({ ...base });
    render(<DestinationsPanel tripId="t1" tripTitle="Trip" me={null} />);
    expect(screen.queryByTestId('vote-hint')).not.toBeInTheDocument();
  });

  it('shows a retry on error', () => {
    h.useDestinationsPanel.mockReturnValue({ ...base, isError: true });
    render(<DestinationsPanel tripId="t1" tripTitle="Trip" me={null} />);
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
  });
});
