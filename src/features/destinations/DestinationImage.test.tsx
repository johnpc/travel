import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({
  useMediaUrl: vi.fn(),
  useWikiPhotos: vi.fn(),
  useDestinationImage: vi.fn(),
  mutate: vi.fn(),
}));
vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: h.useMediaUrl }));
vi.mock('./useWikiPhoto', () => ({ useWikiPhotos: h.useWikiPhotos }));
vi.mock('./useDestinationImage', () => ({ useDestinationImage: h.useDestinationImage }));

import { DestinationImage } from './DestinationImage';
import type { DestinationRecord } from '../../lib/dataClient';

const dest = { id: 'd1', name: 'Santorini' } as DestinationRecord;

describe('DestinationImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useDestinationImage.mockReturnValue({ mutate: h.mutate, isPending: false });
  });

  it('shows a carousel of real Commons photos automatically, no tap', () => {
    h.useMediaUrl.mockReturnValue(null);
    h.useWikiPhotos.mockReturnValue(['https://wiki/1.jpg', 'https://wiki/2.jpg']);
    render(<DestinationImage tripId="t1" destination={dest} />);
    expect(screen.getByTestId('photo-carousel')).toBeInTheDocument();
    expect(screen.getAllByTestId('carousel-photo')).toHaveLength(2);
    expect(screen.getByTestId('dest-image-gen')).toHaveTextContent('Imagine it with AI');
    fireEvent.click(screen.getByTestId('dest-image-gen'));
    expect(h.mutate).toHaveBeenCalled();
  });

  it('prefers a group-generated AI view over the photo carousel', () => {
    h.useMediaUrl.mockReturnValue('https://s3/generated.webp');
    h.useWikiPhotos.mockReturnValue(['https://wiki/1.jpg']);
    render(<DestinationImage tripId="t1" destination={dest} />);
    expect(screen.getByTestId('dest-image-img')).toHaveAttribute('src', 'https://s3/generated.webp'); // prettier-ignore
    expect(screen.queryByTestId('photo-carousel')).not.toBeInTheDocument();
    expect(screen.getByTestId('dest-image-gen')).toHaveTextContent('Reimagine with AI');
  });

  it('shows just the imagine action when there is no photo at all', () => {
    h.useMediaUrl.mockReturnValue(null);
    h.useWikiPhotos.mockReturnValue([]);
    render(<DestinationImage tripId="t1" destination={dest} />);
    expect(screen.queryByTestId('photo-carousel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dest-image-img')).not.toBeInTheDocument();
    expect(screen.getByTestId('dest-image-gen')).toBeInTheDocument();
  });

  it('shows a loading state while generating', () => {
    h.useMediaUrl.mockReturnValue(null);
    h.useWikiPhotos.mockReturnValue([]);
    h.useDestinationImage.mockReturnValue({ mutate: h.mutate, isPending: true });
    render(<DestinationImage tripId="t1" destination={dest} />);
    expect(screen.getByTestId('dest-image-loading')).toBeInTheDocument();
  });
});
