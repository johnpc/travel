import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../destinations/DestinationsPanel', () => ({
  DestinationsPanel: () => <div data-testid="destinations-panel" />,
}));
vi.mock('../itinerary/ItinerarySection', () => ({ ItinerarySection: () => <div data-testid="itinerary" /> })); // prettier-ignore
vi.mock('../chat/ChatSection', () => ({ ChatSection: () => <div data-testid="chat" /> }));
vi.mock('../availability/AvailabilityPanel', () => ({ AvailabilityPanel: () => <div data-testid="availability-panel" /> })); // prettier-ignore

import { TripColumns } from './TripColumns';
import type { MemberRecord, TripRecord } from '../../lib/dataClient';

const join = { me: 'Alex', join: vi.fn(), pick: vi.fn(), isJoining: false };
const start = { year: 2027, month: 6, day: 1 };

describe('TripColumns', () => {
  it('renders the brainstorm board + the roster/availability rail', () => {
    const trip = { id: 't1', title: 'Greece 2027' } as TripRecord;
    const members = [{ id: '1', name: 'Alex' }] as MemberRecord[];
    render(
      <MemoryRouter>
        <TripColumns trip={trip} members={members} join={join} start={start} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('destinations-panel')).toBeInTheDocument();
    expect(screen.getByTestId('itinerary')).toBeInTheDocument();
    expect(screen.getByTestId('chat')).toBeInTheDocument();
    expect(screen.getByTestId('availability-panel')).toBeInTheDocument();
    expect(screen.getByTestId('roster')).toBeInTheDocument();
  });
});
