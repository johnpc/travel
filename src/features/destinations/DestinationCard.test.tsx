import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Capture the alert config so tests can drive its buttons (branded confirm).
const present = vi.hoisted(() => vi.fn());
vi.mock('@ionic/react', async (importActual) => {
  const actual = await importActual<typeof import('@ionic/react')>();
  return { ...actual, useIonAlert: () => [present, vi.fn()] };
});
const clickAlertButton = (label: string) => {
  const cfg = present.mock.calls.at(-1)?.[0];
  cfg.buttons.find((btn: { text: string }) => btn.text === label)?.handler?.();
};

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

  it('shows a remove control only when onRemove is provided, and confirms via a branded alert', () => {
    const onRemove = vi.fn();
    present.mockClear();

    // no onRemove → no remove button
    const { rerender } = render(
      <ul>
        <DestinationCard destination={dest} tripId="t1" />
      </ul>,
    );
    expect(screen.queryByTestId('dest-remove')).not.toBeInTheDocument();

    rerender(
      <ul>
        <DestinationCard destination={dest} tripId="t1" onRemove={onRemove} />
      </ul>,
    );
    // tapping × presents a branded confirm, not window.confirm; nothing removed yet
    fireEvent.click(screen.getByTestId('dest-remove'));
    expect(present).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
    // "Keep it" cancels; "Remove" fires the removal
    clickAlertButton('Keep it');
    expect(onRemove).not.toHaveBeenCalled();
    clickAlertButton('Remove');
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('badges the front-runner and marks the card as leader', () => {
    const { rerender } = render(
      <ul>
        <DestinationCard destination={dest} tripId="t1" />
      </ul>,
    );
    expect(screen.queryByTestId('dest-frontrunner')).not.toBeInTheDocument();
    expect(screen.getByTestId('dest-item')).not.toHaveClass('dest-card--leader');

    rerender(
      <ul>
        <DestinationCard destination={dest} tripId="t1" isFrontRunner />
      </ul>,
    );
    expect(screen.getByTestId('dest-frontrunner')).toHaveTextContent('Front-runner');
    expect(screen.getByTestId('dest-item')).toHaveClass('dest-card--leader');
  });
});
