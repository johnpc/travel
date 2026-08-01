import { describe, it, expect } from 'vitest';
import { imagePrompt, imageKey } from './imagePrompt';

describe('imagePrompt', () => {
  it('names the destination and asks for real scenery, no text', () => {
    const p = imagePrompt('Santorini, Greece');
    expect(p).toContain('Santorini, Greece');
    expect(p).toContain('No text');
  });

  it('folds the blurb in when provided', () => {
    const p = imagePrompt('Santorini', 'Blue domes over the caldera.');
    expect(p).toContain('Blue domes over the caldera.');
  });
});

describe('imageKey', () => {
  it('is a stable per-destination webp key under media/destinations', () => {
    expect(imageKey('d1')).toBe('media/destinations/d1.webp');
  });
});
