import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({
  useMediaUrl: vi.fn(),
  useDestinationImage: vi.fn(),
  mutate: vi.fn(),
}));
vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: h.useMediaUrl }));
vi.mock('./useDestinationImage', () => ({ useDestinationImage: h.useDestinationImage }));

import { DestinationImage } from './DestinationImage';
import type { DestinationRecord } from '../../lib/dataClient';

const dest = { id: 'd1', name: 'Santorini' } as DestinationRecord;

describe('DestinationImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useDestinationImage.mockReturnValue({ mutate: h.mutate, isPending: false });
  });

  it('shows a generate button and no image when none exists', () => {
    h.useMediaUrl.mockReturnValue(null);
    render(<DestinationImage tripId="t1" destination={dest} />);
    expect(screen.queryByTestId('dest-image-img')).not.toBeInTheDocument();
    expect(screen.getByTestId('dest-image-gen')).toHaveTextContent('Generate a view');
    fireEvent.click(screen.getByTestId('dest-image-gen'));
    expect(h.mutate).toHaveBeenCalled();
  });

  it('renders the image and a regenerate button when one exists', () => {
    h.useMediaUrl.mockReturnValue('https://s3.example/img.webp');
    render(<DestinationImage tripId="t1" destination={dest} />);
    const img = screen.getByTestId('dest-image-img');
    expect(img).toHaveAttribute('src', 'https://s3.example/img.webp');
    expect(screen.getByTestId('dest-image-gen')).toHaveTextContent('Regenerate');
  });

  it('shows a loading state while generating', () => {
    h.useMediaUrl.mockReturnValue(null);
    h.useDestinationImage.mockReturnValue({ mutate: h.mutate, isPending: true });
    render(<DestinationImage tripId="t1" destination={dest} />);
    expect(screen.getByTestId('dest-image-loading')).toBeInTheDocument();
  });
});
