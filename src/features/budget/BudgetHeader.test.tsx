import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetHeader } from './BudgetHeader';

describe('BudgetHeader', () => {
  it('fires onEstimate when the AI button is tapped', () => {
    const onEstimate = vi.fn();
    render(<BudgetHeader onEstimate={onEstimate} isEstimating={false} />);
    fireEvent.click(screen.getByTestId('budget-estimate'));
    expect(onEstimate).toHaveBeenCalled();
  });

  it('shows a working state and disables while estimating', () => {
    render(<BudgetHeader onEstimate={vi.fn()} isEstimating={true} />);
    const btn = screen.getByTestId('budget-estimate');
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent('Estimating…');
  });
});
