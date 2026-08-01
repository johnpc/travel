import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const h = vi.hoisted(() => ({ useDestinationsPanel: vi.fn() }));
vi.mock('./useDestinationsPanel', () => ({ useDestinationsPanel: h.useDestinationsPanel }));

import { DestinationsPanel } from './DestinationsPanel';
import type { DestinationRecord } from '../../lib/dataClient';

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
};

describe('DestinationsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the empty state when there are no destinations', () => {
    h.useDestinationsPanel.mockReturnValue({ ...base });
    render(<DestinationsPanel tripId="t1" tripTitle="Trip" />);
    expect(screen.getByTestId('load-empty')).toHaveTextContent('No destinations yet');
    expect(screen.getByTestId('suggest-btn')).toBeInTheDocument();
  });

  it('renders the board when destinations exist', () => {
    h.useDestinationsPanel.mockReturnValue({
      ...base,
      destinations: [{ id: '1', name: 'Rome', source: 'MANUAL' }] as DestinationRecord[],
    });
    render(<DestinationsPanel tripId="t1" tripTitle="Trip" />);
    expect(screen.getByTestId('dest-list')).toBeInTheDocument();
    expect(screen.getByText('Rome')).toBeInTheDocument();
  });

  it('shows a retry on error', () => {
    h.useDestinationsPanel.mockReturnValue({ ...base, isError: true });
    render(<DestinationsPanel tripId="t1" tripTitle="Trip" />);
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
  });
});
