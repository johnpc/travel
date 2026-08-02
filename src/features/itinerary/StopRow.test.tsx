import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const present = vi.hoisted(() => vi.fn());
vi.mock('@ionic/react', () => ({
  IonIcon: () => null,
  useIonAlert: () => [present, vi.fn()],
}));

import { StopRow } from './StopRow';
import type { ItineraryStopRecord } from '../../lib/dataClient';

const stop = { id: 's1', place: 'Bangkok', nights: 3, note: 'Great food.' } as ItineraryStopRecord;

describe('StopRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows order number, place, nights and note', () => {
    render(<StopRow stop={stop} index={1} total={3} onMove={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByTestId('stop-row')).toHaveTextContent('2'); // index+1
    expect(screen.getByText('Bangkok')).toBeInTheDocument();
    expect(screen.getByText('3 nights')).toBeInTheDocument();
    expect(screen.getByText('Great food.')).toBeInTheDocument();
  });

  it('moves up/down via the arrows', () => {
    const onMove = vi.fn();
    render(<StopRow stop={stop} index={1} total={3} onMove={onMove} onRemove={vi.fn()} />);
    fireEvent.click(screen.getByTestId('stop-up'));
    expect(onMove).toHaveBeenCalledWith(1, -1);
    fireEvent.click(screen.getByTestId('stop-down'));
    expect(onMove).toHaveBeenCalledWith(1, 1);
  });

  it('disables up on the first row and down on the last', () => {
    const { rerender } = render(
      <StopRow stop={stop} index={0} total={3} onMove={vi.fn()} onRemove={vi.fn()} />,
    );
    expect(screen.getByTestId('stop-up')).toBeDisabled();
    rerender(<StopRow stop={stop} index={2} total={3} onMove={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByTestId('stop-down')).toBeDisabled();
  });

  it('confirms before removing (branded alert)', () => {
    render(<StopRow stop={stop} index={0} total={1} onMove={vi.fn()} onRemove={vi.fn()} />);
    fireEvent.click(screen.getByTestId('stop-remove'));
    expect(present).toHaveBeenCalled();
    expect(present.mock.calls.at(-1)?.[0].header).toBe('Remove this stop?');
  });
});
