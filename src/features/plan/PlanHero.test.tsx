import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanHero } from './PlanHero';

describe('PlanHero', () => {
  it('renders the photo once its URL resolves', () => {
    render(<PlanHero src="https://s3/x.webp" alt="Bali" />);
    const img = screen.getByTestId('plan-hero');
    expect(img).toHaveAttribute('src', 'https://s3/x.webp');
    expect(img).toHaveAttribute('alt', 'Bali');
  });

  it('reserves the space with a placeholder while the URL is unresolved', () => {
    const { container } = render(<PlanHero src={null} alt="Bali" />);
    expect(screen.queryByTestId('plan-hero')).not.toBeInTheDocument();
    expect(container.querySelector('.plan__hero--placeholder')).toBeInTheDocument();
  });
});
