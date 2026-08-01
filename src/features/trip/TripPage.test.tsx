import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const h = vi.hoisted(() => ({ useTripPage: vi.fn(), useJoinTrip: vi.fn() }));
vi.mock('./useTripPage', () => ({ useTripPage: h.useTripPage }));
vi.mock('./useJoinTrip', () => ({ useJoinTrip: h.useJoinTrip }));

import { TripPage } from './TripPage';

const renderPage = () =>
  render(
    <MemoryRouter>
      <TripPage />
    </MemoryRouter>,
  );

describe('TripPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useJoinTrip.mockReturnValue({ me: null, join: vi.fn(), pick: vi.fn(), isJoining: false });
  });

  it('renders the trip title + roster when loaded', () => {
    h.useTripPage.mockReturnValue({
      slug: 'greece',
      trip: { id: 't1', title: 'Greece 2027', slug: 'greece' },
      members: [{ id: '1', name: 'Alex' }],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    renderPage();
    expect(screen.getByTestId('trip-title')).toHaveTextContent('Greece 2027');
    expect(screen.getByTestId('roster-member')).toHaveTextContent('Alex');
  });

  it('shows the retryable error state when the trip fails to load', () => {
    h.useTripPage.mockReturnValue({
      slug: 'greece',
      trip: null,
      members: [],
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });
    renderPage();
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
  });
});
