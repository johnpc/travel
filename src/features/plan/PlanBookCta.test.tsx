import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanBookCta } from './PlanBookCta';

describe('PlanBookCta', () => {
  it('links to flight and hotel searches for the destination', () => {
    render(<PlanBookCta destinationName="Lisbon, Portugal" />);
    expect(screen.getByTestId('book-flights')).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/travel/flights'),
    );
    expect(screen.getByTestId('book-hotels')).toHaveAttribute(
      'href',
      expect.stringContaining('booking.com'),
    );
  });

  it('pre-fills the agreed dates into both searches', () => {
    render(<PlanBookCta destinationName="Lisbon, Portugal" dates={{ start: '2027-06-12', end: '2027-06-18' }} />); // prettier-ignore
    expect(screen.getByTestId('book-hotels')).toHaveAttribute(
      'href',
      expect.stringContaining('checkin=2027-06-12&checkout=2027-06-18'),
    );
    expect(screen.getByTestId('book-flights')).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent('from 2027-06-12 to 2027-06-18')),
    );
  });
});
