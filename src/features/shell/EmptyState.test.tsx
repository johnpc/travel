import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { compassOutline } from 'ionicons/icons';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title and optional message + test id', () => {
    render(
      <EmptyState icon={compassOutline} title="Nothing here" message="Try later" testId="empty" />,
    );
    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Try later')).toBeInTheDocument();
  });

  it('renders children (action slot) and omits message when not given', () => {
    render(
      <EmptyState icon={compassOutline} title="Empty">
        <a href="/x">Go</a>
      </EmptyState>,
    );
    expect(screen.getByRole('link', { name: 'Go' })).toBeInTheDocument();
  });
});
