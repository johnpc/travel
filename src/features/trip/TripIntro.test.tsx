import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('./TripWelcome', () => ({ TripWelcome: () => <div data-testid="trip-welcome" /> }));
vi.mock('./JoinBar', () => ({ JoinBar: () => <div data-testid="join-bar" /> }));

import { TripIntro } from './TripIntro';
import type { TripRecord } from '../../lib/dataClient';

const trip = { id: 't1', title: 'Greece 2027', description: 'Island hopping.' } as TripRecord;

describe('TripIntro', () => {
  it('renders the URL kicker, title, description, and onboarding affordances', () => {
    render(
      <TripIntro slug="greece-2027" trip={trip} me={null} onJoin={vi.fn()} isJoining={false} />,
    );
    expect(screen.getByTestId('trip-title')).toHaveTextContent('Greece 2027');
    expect(screen.getByText(/travel\.jpc\.io\/greece-2027/)).toBeInTheDocument();
    expect(screen.getByText('Island hopping.')).toBeInTheDocument();
    expect(screen.getByTestId('trip-welcome')).toBeInTheDocument();
    expect(screen.getByTestId('join-bar')).toBeInTheDocument();
  });

  it('omits the description line when the trip has none', () => {
    render(
      <TripIntro
        slug="x"
        trip={{ id: 't', title: 'X' } as TripRecord}
        me="Alex"
        onJoin={vi.fn()}
        isJoining={false}
      />,
    );
    expect(screen.getByTestId('trip-title')).toHaveTextContent('X');
  });
});
