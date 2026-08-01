import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DestinationList } from './DestinationList';
import type { DestinationRecord } from '../../lib/dataClient';

const dests = [
  { id: '1', name: 'Santorini', blurb: 'Blue domes.', why: 'Iconic.', source: 'AI' },
  { id: '2', name: 'Lisbon', source: 'MANUAL' },
] as DestinationRecord[];

describe('DestinationList', () => {
  it('renders each destination with its blurb and why', () => {
    render(<DestinationList destinations={dests} />);
    expect(screen.getAllByTestId('dest-item')).toHaveLength(2);
    expect(screen.getByText('Santorini')).toBeInTheDocument();
    expect(screen.getByText('Blue domes.')).toBeInTheDocument();
    expect(screen.getByText('Iconic.')).toBeInTheDocument();
    expect(screen.getByText('Lisbon')).toBeInTheDocument();
  });
});
