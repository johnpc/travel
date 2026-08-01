import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityItem } from './ActivityItem';
import type { ActivityRecord } from '../../lib/dataClient';

const act = { id: '1', title: 'Wine tour', blurb: 'Taste wines.', category: 'Food & Drink' } as ActivityRecord; // prettier-ignore

describe('ActivityItem', () => {
  it('renders the activity and a GetYourGuide search link', () => {
    render(
      <ul>
        <ActivityItem activity={act} destinationName="Santorini, Greece" />
      </ul>,
    );
    expect(screen.getByText('Wine tour')).toBeInTheDocument();
    const link = screen.getByTestId('act-gyg');
    expect(link).toHaveAttribute(
      'href',
      'https://www.getyourguide.com/s/?q=Wine%20tour%20Santorini%2C%20Greece',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
