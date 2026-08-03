import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({
  useMediaUrl: vi.fn(),
  useWikiPhotosState: vi.fn(),
  useDestinationImage: vi.fn(),
  mutate: vi.fn(),
}));
vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: h.useMediaUrl }));
vi.mock('./useWikiPhoto', () => ({ useWikiPhotosState: h.useWikiPhotosState }));
vi.mock('./useDestinationImage', () => ({ useDestinationImage: h.useDestinationImage }));

import { DestinationImage } from './DestinationImage';
import type { DestinationRecord } from '../../lib/dataClient';

const dest = { id: 'd1', name: 'Santorini' } as DestinationRecord;
// photos + whether the Commons search has settled (loading vs done-no-match).
const wiki = (photos: string[], settled = true) => ({ photos, settled });

describe('DestinationImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useDestinationImage.mockReturnValue({ mutate: h.mutate, isPending: false });
  });

  it('shows a carousel of real Commons photos automatically, no tap', () => {
    h.useMediaUrl.mockReturnValue(null);
    h.useWikiPhotosState.mockReturnValue(wiki(['https://wiki/1.jpg', 'https://wiki/2.jpg']));
    render(<DestinationImage tripId="t1" destination={dest} />);
    expect(screen.getByTestId('photo-carousel')).toBeInTheDocument();
    expect(screen.getAllByTestId('carousel-photo')).toHaveLength(2);
    expect(screen.getByTestId('dest-image-gen')).toHaveTextContent('Imagine it with AI');
    fireEvent.click(screen.getByTestId('dest-image-gen'));
    expect(h.mutate).toHaveBeenCalled();
  });

  it('prefers a group-generated AI view over the photo carousel', () => {
    h.useMediaUrl.mockReturnValue('https://s3/generated.webp');
    h.useWikiPhotosState.mockReturnValue(wiki(['https://wiki/1.jpg']));
    render(<DestinationImage tripId="t1" destination={dest} />);
    expect(screen.getByTestId('dest-image-img')).toHaveAttribute('src', 'https://s3/generated.webp'); // prettier-ignore
    expect(screen.queryByTestId('photo-carousel')).not.toBeInTheDocument();
    expect(screen.getByTestId('dest-image-gen')).toHaveTextContent('Reimagine with AI');
  });

  it('reserves the image slot (placeholder) while photos are still loading', () => {
    h.useMediaUrl.mockReturnValue(null);
    h.useWikiPhotosState.mockReturnValue(wiki([], false)); // not settled yet
    render(<DestinationImage tripId="t1" destination={dest} />);
    expect(screen.queryByTestId('photo-carousel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dest-image-img')).not.toBeInTheDocument();
    // a fixed-aspect placeholder holds the space so the card doesn't jump on load
    expect(screen.getByTestId('dest-image-placeholder')).toBeInTheDocument();
    expect(screen.queryByTestId('dest-image-empty')).not.toBeInTheDocument();
  });

  it('shows an inviting empty state when no stock photo matches (freeform name)', () => {
    h.useMediaUrl.mockReturnValue(null);
    h.useWikiPhotosState.mockReturnValue(wiki([], true)); // settled, no match
    render(<DestinationImage tripId="t1" destination={dest} />);
    const empty = screen.getByTestId('dest-image-empty');
    expect(empty).toBeInTheDocument();
    expect(empty).toHaveTextContent(/imagine one/i);
    // NOT the bare placeholder void
    expect(screen.queryByTestId('dest-image-placeholder')).not.toBeInTheDocument();
    expect(screen.getByTestId('dest-image-gen')).toBeInTheDocument();
  });

  it('shows a loading state while generating', () => {
    h.useMediaUrl.mockReturnValue(null);
    h.useWikiPhotosState.mockReturnValue(wiki([], true));
    h.useDestinationImage.mockReturnValue({ mutate: h.mutate, isPending: true });
    render(<DestinationImage tripId="t1" destination={dest} />);
    expect(screen.getByTestId('dest-image-loading')).toBeInTheDocument();
  });

  it('surfaces a retryable message when generation fails (no silent failure)', () => {
    h.useMediaUrl.mockReturnValue(null);
    h.useWikiPhotosState.mockReturnValue(wiki(['https://wiki/1.jpg']));
    h.useDestinationImage.mockReturnValue({ mutate: h.mutate, isPending: false, isError: true });
    render(<DestinationImage tripId="t1" destination={dest} />);
    expect(screen.getByTestId('dest-image-error')).toHaveTextContent(/try again/i);
    // the button stays live to re-run
    fireEvent.click(screen.getByTestId('dest-image-gen'));
    expect(h.mutate).toHaveBeenCalled();
  });

  it("shows a freshly generated image immediately from the mutation's returned path", () => {
    // The row has no persisted imagePath yet, but the mutation just returned one —
    // it must render now, not wait for a reload (the live query misses the write).
    h.useWikiPhotosState.mockReturnValue(wiki([], true));
    h.useDestinationImage.mockReturnValue({
      mutate: h.mutate,
      isPending: false,
      data: 'media/destinations/fresh.webp',
    });
    render(<DestinationImage tripId="t1" destination={{ id: 'd1', name: 'Santorini' } as DestinationRecord} />); // prettier-ignore
    // useMediaUrl must be resolving the fresh path, not the (empty) row path
    expect(h.useMediaUrl).toHaveBeenCalledWith('media/destinations/fresh.webp');
  });
});
