import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({ useBudgetPanel: vi.fn() }));
vi.mock('./useBudgetPanel', () => ({ useBudgetPanel: h.useBudgetPanel }));

import { BudgetSection } from './BudgetSection';

const base = {
  form: { flightPerPerson: '500', lodgingPerNight: '200', nights: '4', seasonNote: '' },
  set: vi.fn(),
  submit: vi.fn(),
  totals: { perPerson: 900, perCouple: 1800, hasEstimate: true },
  isSaving: false,
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
    render(<BudgetSection tripId="t1" destinationId="d1" />);
    expect(screen.getByTestId('budget-per-person')).toHaveTextContent('$900');
    expect(screen.getByTestId('budget-per-couple')).toHaveTextContent('$1,800');
  });

  it('submits the estimate on save', () => {
    const submit = vi.fn();
    h.useBudgetPanel.mockReturnValue({ ...base, submit });
    render(<BudgetSection tripId="t1" destinationId="d1" />);
    fireEvent.submit(screen.getByTestId('budget-form'));
    expect(submit).toHaveBeenCalled();
  });

  it('shows a retry on error', () => {
    h.useBudgetPanel.mockReturnValue({ ...base, isError: true });
    render(<BudgetSection tripId="t1" destinationId="d1" />);
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
  });
});
