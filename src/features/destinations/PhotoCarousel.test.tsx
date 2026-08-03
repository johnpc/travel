import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoCarousel } from './PhotoCarousel';

describe('PhotoCarousel', () => {
  it('renders nothing with no photos', () => {
    const { container } = render(<PhotoCarousel photos={[]} alt="X" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders each photo with descriptive alt text', () => {
    render(<PhotoCarousel photos={['a.jpg', 'b.jpg', 'c.jpg']} alt="Santorini" />);
    const imgs = screen.getAllByTestId('carousel-photo');
    expect(imgs).toHaveLength(3);
    expect(imgs[0]).toHaveAttribute('alt', 'Santorini (1 of 3)');
    expect(imgs[0]).toHaveAttribute('src', 'a.jpg');
  });

  it('shows dot indicators only when there is more than one photo', () => {
    const { rerender, container } = render(<PhotoCarousel photos={['a.jpg']} alt="X" />);
    expect(container.querySelectorAll('.carousel__dot')).toHaveLength(0);
    rerender(<PhotoCarousel photos={['a.jpg', 'b.jpg']} alt="X" />);
    expect(container.querySelectorAll('.carousel__dot')).toHaveLength(2);
  });

  it('makes the dots labelled buttons that scroll to their photo (click, not just swipe)', () => {
    render(<PhotoCarousel photos={['a.jpg', 'b.jpg', 'c.jpg']} alt="Santorini" />);
    const dots = screen.getAllByTestId('carousel-dot');
    expect(dots[1].tagName).toBe('BUTTON');
    expect(dots[1]).toHaveAttribute('aria-label', 'View photo 2 of 3');
    // clicking a dot scrolls the track to that photo's offset (i * clientWidth)
    const track = screen.getByRole('group');
    Object.defineProperty(track, 'clientWidth', { value: 300, configurable: true });
    const scrollTo = vi.fn();
    track.scrollTo = scrollTo;
    fireEvent.click(dots[2]);
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: 600 }));
  });
});
