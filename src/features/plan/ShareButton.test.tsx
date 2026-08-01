import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({ useShare: vi.fn() }));
vi.mock('./useShare', () => ({ useShare: h.useShare }));

import { ShareButton } from './ShareButton';

describe('ShareButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shares the trip URL on click', () => {
    const share = vi.fn();
    h.useShare.mockReturnValue({ share, copied: false });
    render(<ShareButton slug="greece-2027" />);
    expect(h.useShare).toHaveBeenCalledWith('https://travel.jpc.io/greece-2027');
    fireEvent.click(screen.getByTestId('share-trip'));
    expect(share).toHaveBeenCalled();
  });

  it('shows Copied! after copying', () => {
    h.useShare.mockReturnValue({ share: vi.fn(), copied: true });
    render(<ShareButton slug="greece-2027" />);
    expect(screen.getByTestId('share-trip')).toHaveTextContent('Copied!');
  });
});
