import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddStop } from './AddStop';

// IonInput emits onIonInput; fire the ionInput CustomEvent on the host (jsdom
// doesn't render IonInput's nested native <input>).
function setInput(testid: string, value: string) {
  fireEvent(screen.getByTestId(testid), new CustomEvent('ionInput', { detail: { value } }));
}

describe('AddStop', () => {
  it('adds a stop with place + numeric nights, then clears', () => {
    const onAdd = vi.fn();
    render(<AddStop onAdd={onAdd} />);
    setInput('stop-place', 'Phuket');
    setInput('stop-nights', '4');
    fireEvent.submit(screen.getByTestId('stop-add-form'));
    expect(onAdd).toHaveBeenCalledWith('Phuket', 4);
  });

  it('passes null nights when left blank', () => {
    const onAdd = vi.fn();
    render(<AddStop onAdd={onAdd} />);
    setInput('stop-place', 'Hanoi');
    fireEvent.submit(screen.getByTestId('stop-add-form'));
    expect(onAdd).toHaveBeenCalledWith('Hanoi', null);
  });
});
