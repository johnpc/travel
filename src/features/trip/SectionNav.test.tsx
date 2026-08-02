import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionNav } from './SectionNav';

describe('SectionNav', () => {
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
