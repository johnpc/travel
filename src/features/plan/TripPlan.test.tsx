import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({ useTripPlan: vi.fn(), useMediaUrl: vi.fn(), useWikiPhoto: vi.fn() }));
vi.mock('./useTripPlan', () => ({ useTripPlan: h.useTripPlan }));
vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: h.useMediaUrl }));
vi.mock('../destinations/useWikiPhoto', () => ({ useWikiPhoto: h.useWikiPhoto }));

import { TripPlan } from './TripPlan';
import type { DestinationRecord } from '../../lib/dataClient';

const frontRunner = { id: 'b', name: 'Bali', imagePath: 'media/destinations/b.webp' } as DestinationRecord; // prettier-ignore

const plan = (over = {}) => ({
  isLoading: false,
  isError: false,
  frontRunner,
  frontRunnerVotes: { yes: 2, maybe: 1, no: 0 },
  crew: ['Alex', 'Sam'],
  bestWindow: { start: '2027-06-12', end: '2027-06-18', days: 7 },
  budget: { perPerson: 900, perCouple: 1800, hasEstimate: true },
  readyToBook: false,
  ...over,
});

describe('TripPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useMediaUrl.mockReturnValue('https://s3.example/b.webp');
    h.useWikiPhoto.mockReturnValue(null);
  });

  it('renders nothing until there is a front-runner', () => {
    h.useTripPlan.mockReturnValue({ isLoading: false, isError: false, frontRunner: null });
    const { container } = render(<TripPlan tripId="t1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('reads like an invitation: destination with the crew, dates, cost, hero image', () => {
    h.useTripPlan.mockReturnValue(plan());
    render(<TripPlan tripId="t1" />);
    expect(screen.getByTestId('plan-frontrunner')).toHaveTextContent('Bali with Alex & Sam');
    expect(screen.getByTestId('plan-dates')).toHaveTextContent('7 days that work so far');
    expect(screen.getByTestId('plan-budget')).toHaveTextContent('$900');
    expect(screen.getByTestId('plan-hero')).toHaveAttribute('src', 'https://s3.example/b.webp');
  });

  it('shows the vote tally with an "N of M voted" denominator when the roster size is known', () => {
    h.useTripPlan.mockReturnValue(plan());
    render(<TripPlan tripId="t1" memberCount={4} />);
    // 2 + 1 + 0 = 3 of the 4-person crew have weighed in on the front-runner
    expect(screen.getByTestId('plan-votes')).toHaveTextContent('2 in · 1 maybe · 0 pass · 3 of 4 voted'); // prettier-ignore
  });

  it('omits the denominator when the roster size is unknown', () => {
    h.useTripPlan.mockReturnValue(plan());
    render(<TripPlan tripId="t1" />);
    const votes = screen.getByTestId('plan-votes');
    expect(votes).toHaveTextContent('2 in · 1 maybe · 0 pass');
    expect(votes).not.toHaveTextContent('voted');
  });

  it('reserves the hero height with a placeholder until a photo resolves', () => {
    h.useMediaUrl.mockReturnValue(null);
    h.useWikiPhoto.mockReturnValue(null);
    h.useTripPlan.mockReturnValue(plan());
    const { container } = render(<TripPlan tripId="t1" />);
    expect(screen.queryByTestId('plan-hero')).not.toBeInTheDocument();
    expect(container.querySelector('.plan__hero--placeholder')).toBeInTheDocument();
  });

  it('shows the "lock it in" booking CTA only when ready', () => {
    h.useTripPlan.mockReturnValue(plan({ readyToBook: false }));
    const { rerender } = render(<TripPlan tripId="t1" />);
    expect(screen.queryByTestId('plan-book')).not.toBeInTheDocument();

    h.useTripPlan.mockReturnValue(plan({ readyToBook: true }));
    rerender(<TripPlan tripId="t1" />);
    expect(screen.getByTestId('plan-book')).toBeInTheDocument();
    expect(screen.getByTestId('book-flights')).toBeInTheDocument();
  });

  it('nudges for dates + budget when they are missing', () => {
    h.useTripPlan.mockReturnValue(plan({ bestWindow: null, budget: null, crew: [] }));
    render(<TripPlan tripId="t1" />);
    expect(screen.getByTestId('plan-dates')).toHaveTextContent('Mark your dates');
    expect(screen.getByTestId('plan-budget')).toHaveTextContent('Add a budget estimate');
  });

  it('makes the date nudge a shortcut that scrolls to the calendar', () => {
    h.useTripPlan.mockReturnValue(plan({ bestWindow: null }));
    const anchor = document.createElement('div');
    anchor.id = 'trip-dates';
    const scrollIntoView = vi.fn();
    anchor.scrollIntoView = scrollIntoView;
    document.body.appendChild(anchor);

    render(<TripPlan tripId="t1" />);
    const row = screen.getByTestId('plan-dates');
    expect(row.tagName).toBe('BUTTON');
    fireEvent.click(row);
    expect(scrollIntoView).toHaveBeenCalled();

    document.body.removeChild(anchor);
  });

  it('keeps the date row static (not a button) once a window is found', () => {
    h.useTripPlan.mockReturnValue(plan());
    render(<TripPlan tripId="t1" />);
    expect(screen.getByTestId('plan-dates').tagName).not.toBe('BUTTON');
  });
});
