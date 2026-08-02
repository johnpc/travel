import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
