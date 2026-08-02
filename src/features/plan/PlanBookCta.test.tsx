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
});
