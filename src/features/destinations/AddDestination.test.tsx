import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddDestination } from './AddDestination';

describe('AddDestination', () => {
  it('submits the typed name and clears', () => {
    const onAdd = vi.fn();
    render(<AddDestination onAdd={onAdd} isAdding={false} />);
    fireEvent(
      screen.getByTestId('dest-name'),
      new CustomEvent('ionInput', { detail: { value: 'Lisbon' } }),
    );
    fireEvent.submit(screen.getByTestId('dest-add-form'));
    expect(onAdd).toHaveBeenCalledWith('Lisbon');
  });

  it('shows an "Adding…" in-progress label so the tap is acknowledged', () => {
    render(<AddDestination onAdd={vi.fn()} isAdding />);
    expect(screen.getByTestId('dest-add')).toHaveTextContent('Adding…');
  });
});
