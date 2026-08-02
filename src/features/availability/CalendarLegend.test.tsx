import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalendarLegend } from './CalendarLegend';

describe('CalendarLegend', () => {
  it('explains that shaded days work and the number is the free count', () => {
    render(<CalendarLegend />);
    const legend = screen.getByTestId('cal-legend');
    expect(legend).toHaveTextContent(/shaded days work/i);
    expect(legend).toHaveTextContent(/how many are free/i);
  });
});
