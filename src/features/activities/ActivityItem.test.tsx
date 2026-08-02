import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('shows a remove control only when onRemove is given, and confirms first', () => {
    const onRemove = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm');

    const { rerender } = render(
      <ul>
        <ActivityItem activity={act} destinationName="Santorini" />
      </ul>,
    );
    expect(screen.queryByTestId('act-remove')).not.toBeInTheDocument();

    rerender(
      <ul>
        <ActivityItem activity={act} destinationName="Santorini" onRemove={onRemove} />
      </ul>,
    );
    confirmSpy.mockReturnValueOnce(false);
    fireEvent.click(screen.getByTestId('act-remove'));
    expect(onRemove).not.toHaveBeenCalled();
    confirmSpy.mockReturnValueOnce(true);
    fireEvent.click(screen.getByTestId('act-remove'));
    expect(onRemove).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });
});
