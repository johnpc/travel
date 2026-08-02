import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({ useItineraryPanel: vi.fn() }));
vi.mock('./useItineraryPanel', () => ({ useItineraryPanel: h.useItineraryPanel }));

import { ItinerarySection } from './ItinerarySection';

const base = {
  stops: [],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  addManual: vi.fn(),
  remove: vi.fn(),
  move: vi.fn(),
  suggestions: [],
  isSuggesting: false,
  runSuggest: vi.fn(),
  accept: vi.fn(),
};

describe('ItinerarySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useItineraryPanel.mockReturnValue({ ...base });
  });

  it('shows an empty state when there are no stops yet', () => {
    render(<ItinerarySection tripId="t1" tripTitle="Asia" />);
    expect(screen.getByText('No stops yet')).toBeInTheDocument();
  });

  it('renders the ordered stops when present', () => {
    h.useItineraryPanel.mockReturnValue({
      ...base,
      stops: [
        { id: 'a', place: 'Tokyo', order: 0 },
        { id: 'b', place: 'Bangkok', order: 1 },
      ],
    });
    render(<ItinerarySection tripId="t1" tripTitle="Asia" />);
    expect(screen.getAllByTestId('stop-row')).toHaveLength(2);
  });

  it('asks the AI to suggest a route', () => {
    const runSuggest = vi.fn();
    h.useItineraryPanel.mockReturnValue({ ...base, runSuggest });
    render(<ItinerarySection tripId="t1" tripTitle="Asia" />);
    fireEvent.click(screen.getByTestId('route-suggest'));
    expect(runSuggest).toHaveBeenCalled();
  });
});
