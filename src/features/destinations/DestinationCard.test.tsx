import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../activities/ActivitiesSection', () => ({
  ActivitiesSection: () => <div data-testid="activities" />,
}));
vi.mock('../budget/BudgetSection', () => ({ BudgetSection: () => <div data-testid="budget" /> }));
vi.mock('./DestinationImage', () => ({ DestinationImage: () => <div data-testid="dest-image" /> }));

import { DestinationCard } from './DestinationCard';
import type { DestinationRecord } from '../../lib/dataClient';

const dest = { id: '1', name: 'Santorini', blurb: 'Blue domes.', why: 'Iconic.', source: 'AI' } as DestinationRecord; // prettier-ignore

describe('DestinationCard', () => {
  it('renders name, blurb, why and an optional vote slot', () => {
    render(
      <ul>
        <DestinationCard destination={dest} tripId="t1" vote={<div data-testid="vote-slot" />} />
      </ul>,
    );
    expect(screen.getByText('Santorini')).toBeInTheDocument();
    expect(screen.getByText('Blue domes.')).toBeInTheDocument();
    expect(screen.getByText('Iconic.')).toBeInTheDocument();
    expect(screen.getByTestId('vote-slot')).toBeInTheDocument();
  });

  it('expands to reveal the activities section on toggle', () => {
    render(
      <ul>
        <DestinationCard destination={dest} tripId="t1" />
      </ul>,
    );
    expect(screen.queryByTestId('activities')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('dest-activities-toggle'));
    expect(screen.getByTestId('activities')).toBeInTheDocument();
  });
});
