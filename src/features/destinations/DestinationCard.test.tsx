import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DestinationCard } from './DestinationCard';
import type { DestinationRecord } from '../../lib/dataClient';

const dest = { id: '1', name: 'Santorini', blurb: 'Blue domes.', why: 'Iconic.', source: 'AI' } as DestinationRecord; // prettier-ignore

describe('DestinationCard', () => {
  it('renders name, blurb, why and an optional vote slot', () => {
    render(
      <ul>
        <DestinationCard destination={dest} vote={<div data-testid="vote-slot" />} />
      </ul>,
    );
    expect(screen.getByText('Santorini')).toBeInTheDocument();
    expect(screen.getByText('Blue domes.')).toBeInTheDocument();
    expect(screen.getByText('Iconic.')).toBeInTheDocument();
    expect(screen.getByTestId('vote-slot')).toBeInTheDocument();
  });

  it('renders without a vote slot', () => {
    render(
      <ul>
        <DestinationCard destination={dest} />
      </ul>,
    );
    expect(screen.getByTestId('dest-item')).toBeInTheDocument();
  });
});
