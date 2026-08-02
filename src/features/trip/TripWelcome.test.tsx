import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const h = vi.hoisted(() => ({ useDestinations: vi.fn() }));
vi.mock('../destinations/destinationApi', () => ({ useDestinations: h.useDestinations }));

import { TripWelcome } from './TripWelcome';
import type { DestinationRecord } from '../../lib/dataClient';

describe('TripWelcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the welcome + steps on an empty, loaded trip', () => {
    h.useDestinations.mockReturnValue({ data: [], isLoading: false });
    render(<TripWelcome tripId="t1" hasIdentity={false} />);
    expect(screen.getByTestId('trip-welcome')).toBeInTheDocument();
    expect(screen.getByText(/Add your name/)).toBeInTheDocument();
    expect(screen.getByText(/AI suggest/)).toBeInTheDocument();
  });

  it('hides once the trip has any destination', () => {
    h.useDestinations.mockReturnValue({
      data: [{ id: '1', name: 'Rome' }] as DestinationRecord[],
      isLoading: false,
    });
    const { container } = render(<TripWelcome tripId="t1" hasIdentity={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('does not flash while destinations are loading', () => {
    h.useDestinations.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<TripWelcome tripId="t1" hasIdentity={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('emphasizes the add-your-name step until the visitor has an identity', () => {
    h.useDestinations.mockReturnValue({ data: [], isLoading: false });
    const { rerender } = render(<TripWelcome tripId="t1" hasIdentity={false} />);
    expect(document.querySelector('.welcome__step--now')).toBeInTheDocument();
    rerender(<TripWelcome tripId="t1" hasIdentity />);
    expect(document.querySelector('.welcome__step--now')).not.toBeInTheDocument();
  });
});
