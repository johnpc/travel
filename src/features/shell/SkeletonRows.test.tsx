import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkeletonRows } from './SkeletonRows';

describe('SkeletonRows', () => {
  it('renders a busy list of the requested row count', () => {
    render(<SkeletonRows count={3} />);
    const list = screen.getByTestId('skeleton-rows');
    expect(list).toHaveAttribute('aria-busy', 'true');
    expect(list.querySelectorAll('.tv-skeleton-row')).toHaveLength(3);
  });

  it('defaults to five rows and a Loading label', () => {
    render(<SkeletonRows />);
    const list = screen.getByTestId('skeleton-rows');
    expect(list).toHaveAttribute('aria-label', 'Loading');
    expect(list.querySelectorAll('.tv-skeleton-row')).toHaveLength(5);
  });
});
