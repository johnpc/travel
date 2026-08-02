import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({ useBudgetPanel: vi.fn() }));
vi.mock('./useBudgetPanel', () => ({ useBudgetPanel: h.useBudgetPanel }));
// HotelPicks does its own AI mutation — stub it; it has its own tests.
vi.mock('./HotelPicks', () => ({ HotelPicks: () => <div data-testid="hotels" /> }));

import { BudgetSection } from './BudgetSection';

const base = {
  form: { flightPerPerson: '500', lodgingPerNight: '200', nights: '4', seasonNote: '' },
  set: vi.fn(),
  submit: vi.fn(),
  totals: { perPerson: 900, perCouple: 1800, hasEstimate: true },
  runEstimate: vi.fn(),
  isEstimating: false,
  isSaving: false,
  justSaved: false,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
};

describe('BudgetSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the computed per-person and per-couple totals', () => {
    h.useBudgetPanel.mockReturnValue({ ...base });
    render(<BudgetSection tripId="t1" destinationId="d1" destinationName="Lisbon, Portugal" />);
    expect(screen.getByTestId('budget-per-person')).toHaveTextContent('$900');
    expect(screen.getByTestId('budget-per-couple')).toHaveTextContent('$1,800');
  });

  it('submits the estimate on save', () => {
    const submit = vi.fn();
    h.useBudgetPanel.mockReturnValue({ ...base, submit });
    render(<BudgetSection tripId="t1" destinationId="d1" destinationName="Lisbon, Portugal" />);
    fireEvent.submit(screen.getByTestId('budget-form'));
    expect(submit).toHaveBeenCalled();
  });

  it('shows a retry on error', () => {
    h.useBudgetPanel.mockReturnValue({ ...base, isError: true });
    render(<BudgetSection tripId="t1" destinationId="d1" destinationName="Lisbon, Portugal" />);
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
  });

  it('offers real-price lookup links for flights, hotels and Airbnb', () => {
    h.useBudgetPanel.mockReturnValue({ ...base });
    render(<BudgetSection tripId="t1" destinationId="d1" destinationName="Lisbon, Portugal" />);
    expect(screen.getByTestId('budget-link-flights')).toHaveAttribute('href', expect.stringContaining('google.com/travel/flights')); // prettier-ignore
    expect(screen.getByTestId('budget-link-hotels')).toHaveAttribute('href', expect.stringContaining('booking.com')); // prettier-ignore
    expect(screen.getByTestId('budget-link-airbnb')).toHaveAttribute('href', expect.stringContaining('airbnb.com')); // prettier-ignore
  });

  it('runs the AI estimate when the Estimate button is tapped', () => {
    const runEstimate = vi.fn();
    h.useBudgetPanel.mockReturnValue({ ...base, runEstimate });
    render(<BudgetSection tripId="t1" destinationId="d1" destinationName="Lisbon, Portugal" />);
    fireEvent.click(screen.getByTestId('budget-estimate'));
    expect(runEstimate).toHaveBeenCalled();
  });

  it('confirms a successful save on the button', () => {
    h.useBudgetPanel.mockReturnValue({ ...base }); // not saved yet
    const { rerender } = render(
      <BudgetSection tripId="t1" destinationId="d1" destinationName="Lisbon, Portugal" />,
    );
    expect(screen.getByTestId('budget-save')).toHaveTextContent('Save estimate');
    h.useBudgetPanel.mockReturnValue({ ...base, justSaved: true });
    rerender(<BudgetSection tripId="t1" destinationId="d1" destinationName="Lisbon, Portugal" />);
    expect(screen.getByTestId('budget-save')).toHaveTextContent('Saved ✓');
  });
});
