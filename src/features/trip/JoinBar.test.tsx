import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const h = vi.hoisted(() => ({ useDestinations: vi.fn() }));
vi.mock('../destinations/destinationApi', () => ({ useDestinations: h.useDestinations }));

import { JoinBar } from './JoinBar';
import type { DestinationRecord } from '../../lib/dataClient';

const props = { onJoin: vi.fn(), isJoining: false };
const withDest = () => h.useDestinations.mockReturnValue({ data: [{ id: '1', name: 'Rome' }] as DestinationRecord[], isLoading: false }); // prettier-ignore

describe('JoinBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('offers a join form to a nameless visitor on a non-empty trip', () => {
    withDest();
    render(<JoinBar tripId="t1" hasIdentity={false} {...props} />);
    expect(screen.getByTestId('join-bar')).toBeInTheDocument();
    expect(screen.getByTestId('welcome-join')).toBeInTheDocument();
  });

  it('hides once the visitor has an identity', () => {
    withDest();
    const { container } = render(<JoinBar tripId="t1" hasIdentity {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('hides on an empty trip (the welcome banner covers that case)', () => {
    h.useDestinations.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<JoinBar tripId="t1" hasIdentity={false} {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('does not flash while destinations are loading', () => {
    h.useDestinations.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<JoinBar tripId="t1" hasIdentity={false} {...props} />);
    expect(container).toBeEmptyDOMElement();
  });
});
