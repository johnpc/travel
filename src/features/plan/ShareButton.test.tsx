import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({ useShare: vi.fn() }));
vi.mock('./useShare', () => ({ useShare: h.useShare }));

import { ShareButton } from './ShareButton';

describe('ShareButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shares the trip URL with a title + inviting text on click (icon-only)', () => {
    const share = vi.fn();
    h.useShare.mockReturnValue({ share, copied: false });
    render(<ShareButton slug="greece-2027" title="Greece 2027" />);
    expect(h.useShare).toHaveBeenCalledWith({
      title: 'Greece 2027',
      text: expect.stringContaining('Help plan Greece 2027'),
      url: 'https://travel.jpc.io/greece-2027',
    });
    const btn = screen.getByTestId('share-trip');
    expect(btn).toHaveAccessibleName('Share trip link');
    expect(btn).not.toHaveTextContent('Share');
    fireEvent.click(btn);
    expect(share).toHaveBeenCalled();
  });

  it('shows Copied! after copying', () => {
    h.useShare.mockReturnValue({ share: vi.fn(), copied: true });
    render(<ShareButton slug="greece-2027" title="Greece 2027" />);
    expect(screen.getByTestId('share-trip')).toHaveTextContent('Copied!');
  });
});
