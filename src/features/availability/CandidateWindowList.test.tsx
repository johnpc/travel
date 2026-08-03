import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CandidateWindowList } from './CandidateWindowList';

describe('CandidateWindowList', () => {
  it('renders nothing when there are no windows', () => {
    const { container } = render(<CandidateWindowList windows={[]} onJump={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders each window with its range + free count and jumps on tap', () => {
    const onJump = vi.fn();
    const windows = [
      { start: '2027-06-12', end: '2027-06-18', days: 7, minFree: 3, maxFree: 4 },
      { start: '2027-07-01', end: '2027-07-01', days: 1, minFree: 2, maxFree: 2 },
    ];
    render(<CandidateWindowList windows={windows} onJump={onJump} />);
    const items = screen.getAllByTestId('candidate-window');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Jun 12–18, 2027');
    expect(items[0]).toHaveTextContent('3–4 free');
    expect(items[1]).toHaveTextContent('2 free');
    fireEvent.click(items[0]);
    expect(onJump).toHaveBeenCalledWith(windows[0]);
  });

  it('shows the roster size as denominator when known ("N of M free")', () => {
    const windows = [
      { start: '2027-06-12', end: '2027-06-15', days: 4, minFree: 3, maxFree: 3 },
      { start: '2027-07-01', end: '2027-07-02', days: 2, minFree: 2, maxFree: 4 },
    ];
    render(<CandidateWindowList windows={windows} onJump={vi.fn()} memberCount={4} />);
    const items = screen.getAllByTestId('candidate-window');
    expect(items[0]).toHaveTextContent('3 of 4 free');
    expect(items[1]).toHaveTextContent('2–4 of 4 free');
  });
});
