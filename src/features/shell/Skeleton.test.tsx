import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders a decorative block with default sizing', () => {
    render(<Skeleton />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('tv-skeleton');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el.style.width).toBe('100%');
  });

  it('applies custom width, height, radius, and className', () => {
    render(<Skeleton width="50%" height="2rem" radius="50%" className="avatar" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('tv-skeleton', 'avatar');
    expect(el.style.width).toBe('50%');
    expect(el.style.height).toBe('2rem');
    expect(el.style.borderRadius).toBe('50%');
  });
});
