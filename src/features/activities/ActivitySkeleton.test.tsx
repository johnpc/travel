import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivitySkeleton } from './ActivitySkeleton';

describe('ActivitySkeleton', () => {
  it('previews placeholder cards under a busy, labelled region', () => {
    render(<ActivitySkeleton />);
    const region = screen.getByTestId('act-loading');
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region).toHaveAccessibleName('Dreaming up things to do');
    expect(region.querySelectorAll('.acts__suggestion--skeleton')).toHaveLength(3);
  });

  it('honors a custom count', () => {
    render(<ActivitySkeleton count={4} />);
    expect(
      screen.getByTestId('act-loading').querySelectorAll('.acts__suggestion--skeleton'),
    ).toHaveLength(4);
  });
});
