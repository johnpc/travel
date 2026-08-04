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
  suggestError: false,
  runSuggest: vi.fn(),
  accept: vi.fn(),
};

describe('ItinerarySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useItineraryPanel.mockReturnValue({ ...base });
  });

  it('stays a compact teaser (no editor) when there are no stops', () => {
    render(<ItinerarySection tripId="t1" tripTitle="Asia" />);
    expect(screen.getByTestId('itinerary-open')).toBeInTheDocument();
    // the full editor (AI-route button, add form) is hidden until opened
    expect(screen.queryByTestId('route-suggest')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stop-add-form')).not.toBeInTheDocument();
  });

  it('opens the full editor when the teaser is tapped', () => {
    render(<ItinerarySection tripId="t1" tripTitle="Asia" />);
    fireEvent.click(screen.getByTestId('itinerary-open'));
    expect(screen.getByTestId('route-suggest')).toBeInTheDocument();
    expect(screen.getByText('No stops yet')).toBeInTheDocument();
  });

  it('shows the editor directly (no teaser) when stops already exist', () => {
    h.useItineraryPanel.mockReturnValue({
      ...base,
      stops: [
        { id: 'a', place: 'Tokyo', order: 0 },
        { id: 'b', place: 'Bangkok', order: 1 },
      ],
    });
    render(<ItinerarySection tripId="t1" tripTitle="Asia" />);
    expect(screen.queryByTestId('itinerary-open')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('stop-row')).toHaveLength(2);
  });

  it('asks the AI to suggest a route once opened', () => {
    const runSuggest = vi.fn();
    h.useItineraryPanel.mockReturnValue({ ...base, runSuggest });
    render(<ItinerarySection tripId="t1" tripTitle="Asia" />);
    fireEvent.click(screen.getByTestId('itinerary-open'));
    fireEvent.click(screen.getByTestId('route-suggest'));
    expect(runSuggest).toHaveBeenCalled();
  });

  it('previews a route skeleton while the AI is planning', () => {
    h.useItineraryPanel.mockReturnValue({
      ...base,
      stops: [{ id: 'a', place: 'Tokyo', order: 0 }],
      isSuggesting: true,
    });
    render(<ItinerarySection tripId="t1" tripTitle="Asia" />);
    expect(screen.getByTestId('route-loading')).toBeInTheDocument();
    expect(screen.getByTestId('route-suggest')).toHaveTextContent(/planning/i);
  });

  it('shows a retryable message when the AI route suggest fails', () => {
    // stops present so the editor renders without needing to open the teaser
    h.useItineraryPanel.mockReturnValue({
      ...base,
      stops: [{ id: 'a', place: 'Tokyo', order: 0 }],
      suggestError: true,
    });
    render(<ItinerarySection tripId="t1" tripTitle="Asia" />);
    expect(screen.getByTestId('route-suggest-error')).toHaveTextContent(/try again/i);
  });
});
