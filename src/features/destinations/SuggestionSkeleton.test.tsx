import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SuggestionSkeleton } from './SuggestionSkeleton';

describe('SuggestionSkeleton', () => {
  it('previews a batch of placeholder cards under a busy, labelled region', () => {
    render(<SuggestionSkeleton />);
    const region = screen.getByTestId('suggest-loading');
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region).toHaveAccessibleName('Dreaming up destinations');
    // default batch is 3 cards, each shaped like a real suggestion
    expect(region.querySelectorAll('.suggest__item--skeleton')).toHaveLength(3);
  });

  it('honors a custom count', () => {
    render(<SuggestionSkeleton count={5} />);
    expect(
      screen.getByTestId('suggest-loading').querySelectorAll('.suggest__item--skeleton'),
    ).toHaveLength(5);
  });
});
