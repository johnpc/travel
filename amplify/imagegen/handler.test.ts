import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({
  generateImage: vi.fn(),
  resizeWebp: vi.fn(),
  putMedia: vi.fn(),
  setDestinationImage: vi.fn(),
}));
vi.mock('./shared/bedrockImage', () => ({ generateImage: m.generateImage }));
vi.mock('./shared/resizeImage', () => ({ resizeWebp: m.resizeWebp }));
vi.mock('./shared/s3', () => ({ putMedia: m.putMedia }));
vi.mock('./shared/ddb', () => ({ setDestinationImage: m.setDestinationImage }));

import { handler } from './handler';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const invoke = (args: any) => (handler as any)({ arguments: args }, {} as any, () => {});

describe('generateDestinationImage handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MEDIA_BUCKET = 'bucket';
    process.env.DESTINATION_TABLE = 'DestTable';
    m.generateImage.mockResolvedValue(new Uint8Array([1]));
    m.resizeWebp.mockResolvedValue(new Uint8Array([2]));
    m.putMedia.mockResolvedValue('media/destinations/d1.webp');
    m.setDestinationImage.mockResolvedValue(undefined);
  });

  it('generates → resizes → stores → persists the key and returns it', async () => {
    const res = await invoke({ destinationId: 'd1', name: 'Santorini', blurb: 'Blue domes.' });
    expect(m.generateImage).toHaveBeenCalledOnce();
    expect(m.putMedia).toHaveBeenCalledWith('bucket', 'media/destinations/d1.webp', expect.any(Uint8Array), 'image/webp'); // prettier-ignore
    expect(m.setDestinationImage).toHaveBeenCalledWith('DestTable', 'd1', 'media/destinations/d1.webp'); // prettier-ignore
    expect(res).toEqual({ imagePath: 'media/destinations/d1.webp' });
  });

  it('throws when a required env var is missing', async () => {
    delete process.env.MEDIA_BUCKET;
    await expect(invoke({ destinationId: 'd1', name: 'X' })).rejects.toThrow('MEDIA_BUCKET');
  });
});
