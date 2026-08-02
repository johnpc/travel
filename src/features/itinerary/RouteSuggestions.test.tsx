import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RouteSuggestions } from './RouteSuggestions';

const stops = [
  { place: 'Tokyo', nights: 4, note: 'Start.' },
  { place: 'Bangkok', nights: 3, note: '' },
];

describe('RouteSuggestions', () => {
  it('renders nothing when there are no suggestions', () => {
    const { container } = render(<RouteSuggestions suggestions={[]} onAccept={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lists suggestions and accepts one', () => {
    const onAccept = vi.fn();
    render(<RouteSuggestions suggestions={stops} onAccept={onAccept} />);
    expect(screen.getAllByTestId('route-suggestion')).toHaveLength(2);
    fireEvent.click(screen.getAllByTestId('route-accept')[0]);
    expect(onAccept).toHaveBeenCalledWith(stops[0]);
  });
});
