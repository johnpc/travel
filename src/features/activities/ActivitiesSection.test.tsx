import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({ useActivitiesPanel: vi.fn() }));
vi.mock('./useActivitiesPanel', () => ({ useActivitiesPanel: h.useActivitiesPanel }));

import { ActivitiesSection } from './ActivitiesSection';
import type { ActivityRecord } from '../../lib/dataClient';

const base = {
  activities: [] as ActivityRecord[],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  suggestions: [],
  isSuggesting: false,
  runSuggest: vi.fn(),
  accept: vi.fn(),
};

describe('ActivitiesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the empty state and a suggest button when there are none', () => {
    h.useActivitiesPanel.mockReturnValue({ ...base });
    render(<ActivitiesSection tripId="t1" destinationId="d1" destinationName="Santorini" />);
    expect(screen.getByTestId('load-empty')).toHaveTextContent('No activities yet');
    expect(screen.getByTestId('act-suggest')).toBeInTheDocument();
  });

  it('renders saved activities', () => {
    h.useActivitiesPanel.mockReturnValue({
      ...base,
      activities: [{ id: '1', title: 'Wine tour', blurb: 'Taste wines.', category: 'Food & Drink' }] as ActivityRecord[], // prettier-ignore
    });
    render(<ActivitiesSection tripId="t1" destinationId="d1" destinationName="Santorini" />);
    expect(screen.getByText('Wine tour')).toBeInTheDocument();
  });

  it('accepts an AI suggestion', () => {
    const accept = vi.fn();
    h.useActivitiesPanel.mockReturnValue({
      ...base,
      suggestions: [{ title: 'Hike', blurb: 'Trail.', category: 'Outdoors' }],
      accept,
    });
    render(<ActivitiesSection tripId="t1" destinationId="d1" destinationName="Santorini" />);
    fireEvent.click(screen.getByTestId('act-accept'));
    expect(accept).toHaveBeenCalledWith({ title: 'Hike', blurb: 'Trail.', category: 'Outdoors' });
  });
});
