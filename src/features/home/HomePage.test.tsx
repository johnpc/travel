import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const push = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>();
  return { ...actual, useHistory: () => ({ push }) };
});

import { HomePage } from './HomePage';

const renderHome = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('previews the slug and navigates on start', () => {
    renderHome();
    fireEvent(
      screen.getByTestId('trip-name'),
      new CustomEvent('ionInput', { detail: { value: 'Greece 2027' } }),
    );
    expect(screen.getByTestId('slug-preview')).toHaveTextContent('travel.jpc.io/greece-2027');
    fireEvent.submit(screen.getByTestId('start-form'));
    expect(push).toHaveBeenCalledWith('/greece-2027', { title: 'Greece 2027' });
  });

  it('shows no slug preview until a name is typed', () => {
    renderHome();
    expect(screen.queryByTestId('slug-preview')).not.toBeInTheDocument();
  });
});
