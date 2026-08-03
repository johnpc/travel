import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecentTrips } from './RecentTrips';

const renderWith = (recents: { slug: string; title: string }[], onRemove = vi.fn()) =>
  render(
    <MemoryRouter>
      <RecentTrips recents={recents} onRemove={onRemove} />
    </MemoryRouter>,
  );

describe('RecentTrips', () => {
  it('lists each recent trip linking to its slug', () => {
    renderWith([
      { slug: 'greece-2027', title: 'Greece 2027' },
      { slug: 'portugal', title: 'Portugal' },
    ]);
    const links = screen.getAllByTestId('recent-trip');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent('Greece 2027');
    expect(links[0]).toHaveAttribute('href', '/greece-2027');
  });

  it('renders nothing when there are no recents', () => {
    const { container } = renderWith([]);
    expect(container).toBeEmptyDOMElement();
  });

  it('forgets a trip via its × without following the link', () => {
    const onRemove = vi.fn();
    renderWith([{ slug: 'oops-typo', title: 'Oops Typo' }], onRemove);
    fireEvent.click(screen.getByTestId('recent-forget'));
    expect(onRemove).toHaveBeenCalledWith('oops-typo');
  });
});
