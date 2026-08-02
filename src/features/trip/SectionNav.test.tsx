import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({ useActiveSection: vi.fn<[], string | null>(() => null) }));
vi.mock('./useActiveSection', () => ({ useActiveSection: h.useActiveSection }));

import { SectionNav } from './SectionNav';

describe('SectionNav', () => {
  it('highlights the section currently in view (scroll-spy)', () => {
    h.useActiveSection.mockReturnValue('trip-dates');
    render(<SectionNav />);
    const dates = screen.getByTestId('secnav-trip-dates');
    expect(dates).toHaveClass('secnav__chip--on');
    expect(dates).toHaveAttribute('aria-current', 'true');
    // others are not marked current
    expect(screen.getByTestId('secnav-trip-crew')).not.toHaveAttribute('aria-current');
    h.useActiveSection.mockReturnValue(null);
  });

  it('renders a chip per key section', () => {
    render(<SectionNav />);
    expect(screen.getByTestId('secnav-trip-crew')).toHaveTextContent("Who's in");
    expect(screen.getByTestId('secnav-trip-destinations')).toHaveTextContent('Destinations');
    expect(screen.getByTestId('secnav-trip-dates')).toHaveTextContent('Dates');
    expect(screen.getByTestId('secnav-trip-chat')).toHaveTextContent('Discussion');
  });

  it('smooth-scrolls to the target section on tap', () => {
    render(
      <>
        <SectionNav />
        <div id="trip-dates">dates section</div>
      </>,
    );
    const target = document.getElementById('trip-dates')!;
    const spy = vi.fn();
    target.scrollIntoView = spy;
    fireEvent.click(screen.getByTestId('secnav-trip-dates'));
    expect(spy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });
});
