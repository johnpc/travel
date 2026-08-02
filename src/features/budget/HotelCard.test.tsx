import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HotelCard } from './HotelCard';
import type { HotelPick } from './hotelsApi';

const hotel: HotelPick = {
  name: 'Grace Hotel',
  tier: 'Luxury',
  pricePerNight: 600,
  area: 'Imerovigli',
  pros: 'Stunning caldera pool.',
  cons: 'Pricey.',
};

describe('HotelCard', () => {
  it('renders tier, price, area, pros/cons', () => {
    render(<HotelCard hotel={hotel} destinationName="Santorini, Greece" />);
    expect(screen.getByText('Luxury')).toBeInTheDocument();
    expect(screen.getByText(/\$600/)).toBeInTheDocument();
    expect(screen.getByText('Imerovigli')).toBeInTheDocument();
    expect(screen.getByText(/Stunning caldera pool/)).toBeInTheDocument();
    expect(screen.getByText(/Pricey/)).toBeInTheDocument();
  });

  it('links Book to a Booking.com search and Map to Google Maps for the property', () => {
    render(<HotelCard hotel={hotel} destinationName="Santorini, Greece" />);
    expect(screen.getByTestId('hotel-book')).toHaveAttribute('href', expect.stringContaining('booking.com/searchresults')); // prettier-ignore
    expect(decodeURIComponent(screen.getByTestId('hotel-book').getAttribute('href')!)).toContain('Grace Hotel Santorini'); // prettier-ignore
    expect(screen.getByTestId('hotel-map')).toHaveAttribute('href', expect.stringContaining('google.com/maps/search')); // prettier-ignore
  });

  it('omits the price when unknown', () => {
    render(<HotelCard hotel={{ ...hotel, pricePerNight: null }} destinationName="X" />);
    expect(screen.queryByText(/\/ night/)).not.toBeInTheDocument();
  });
});
