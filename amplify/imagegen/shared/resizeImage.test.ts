import { describe, it, expect, vi, beforeEach } from 'vitest';

const chain = vi.hoisted(() => ({
  resize: vi.fn(),
  webp: vi.fn(),
  toBuffer: vi.fn(),
}));
vi.mock('sharp', () => ({
  default: vi.fn(() => chain),
}));

import { resizeWebp } from './resizeImage';

describe('resizeWebp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chain.resize.mockReturnValue(chain);
    chain.webp.mockReturnValue(chain);
    chain.toBuffer.mockResolvedValue(Buffer.from([9, 9, 9]));
  });

  it('resizes to fit-inside and re-encodes to webp', async () => {
    const out = await resizeWebp(new Uint8Array([1, 2, 3]), 800);
    expect(chain.resize).toHaveBeenCalledWith(800, 800, {
      fit: 'inside',
      withoutEnlargement: true,
    });
    expect(chain.webp).toHaveBeenCalledWith({ quality: 80 });
    expect(Array.from(out)).toEqual([9, 9, 9]);
  });
});
