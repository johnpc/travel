import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({ useSuggestHotels: vi.fn(), mutate: vi.fn() }));
vi.mock('./hotelsApi', () => ({ useSuggestHotels: h.useSuggestHotels }));

import { HotelPicks } from './HotelPicks';

const pick = (over = {}) => ({
  name: 'Grace',
  tier: 'Luxury',
  pricePerNight: 600,
  area: 'Oia',
  pros: 'p',
  cons: 'c',
  ...over,
});

describe('HotelPicks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useSuggestHotels.mockReturnValue({ mutate: h.mutate, isPending: false, data: undefined });
  });

  it('asks the AI for stays on tap', () => {
    render(<HotelPicks destinationName="Santorini, Greece" />);
    fireEvent.click(screen.getByTestId('hotels-suggest'));
    expect(h.mutate).toHaveBeenCalledWith({ destinationName: 'Santorini, Greece' });
  });

  it('shows a working state while finding', () => {
    h.useSuggestHotels.mockReturnValue({ mutate: h.mutate, isPending: true, data: undefined });
    render(<HotelPicks destinationName="X" />);
    expect(screen.getByTestId('hotels-suggest')).toHaveTextContent('Finding stays…');
  });

  it('shows a retryable message when the AI hotel search fails', () => {
    h.useSuggestHotels.mockReturnValue({ mutate: h.mutate, isPending: false, isError: true, data: undefined }); // prettier-ignore
    render(<HotelPicks destinationName="X" />);
    expect(screen.getByTestId('hotels-error')).toHaveTextContent(/try again/i);
  });

  it('renders the picks and the median Airbnb line once loaded', () => {
    h.useSuggestHotels.mockReturnValue({
      mutate: h.mutate,
      isPending: false,
      data: {
        hotels: [pick(), pick({ name: 'Hostel', tier: 'Budget' })],
        airbnbMedianPerNight: 175,
      },
    });
    render(<HotelPicks destinationName="Santorini, Greece" />);
    expect(screen.getAllByTestId('hotel-card')).toHaveLength(2);
    const median = screen.getByTestId('hotels-airbnb-median');
    expect(median).toHaveTextContent(/175/);
    expect(median).toHaveAttribute('href', expect.stringContaining('airbnb.com'));
  });

  it('hides the median line when unknown', () => {
    h.useSuggestHotels.mockReturnValue({
      mutate: h.mutate,
      isPending: false,
      data: { hotels: [pick()], airbnbMedianPerNight: null },
    });
    render(<HotelPicks destinationName="X" />);
    expect(screen.queryByTestId('hotels-airbnb-median')).not.toBeInTheDocument();
  });
});
