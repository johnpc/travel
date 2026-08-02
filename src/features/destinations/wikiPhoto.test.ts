import { describe, it, expect } from 'vitest';
import { wikiTitle, commonsSearchUrl, pickPhotos } from './wikiPhoto';

describe('wikiTitle', () => {
  it('drops the country suffix and trims', () => {
    expect(wikiTitle('Santorini, Greece')).toBe('Santorini');
    expect(wikiTitle('  Lisbon , Portugal ')).toBe('Lisbon');
    expect(wikiTitle('Kyoto')).toBe('Kyoto');
  });
});

describe('commonsSearchUrl', () => {
  it('builds an encoded, scenic-biased Commons image search for the place', () => {
    const url = commonsSearchUrl('Amalfi Coast, Italy');
    expect(url).toContain('commons.wikimedia.org');
    // place name + scenic qualifier so we get postcard views, not street shots
    expect(url).toContain('gsrsearch=Amalfi%20Coast%20panorama');
    expect(url).toContain('gsrnamespace=6'); // File namespace
  });
});

const page = (index: number, title: string, thumburl: string) => ({
  index,
  title,
  imageinfo: [{ thumburl, url: thumburl.replace('/thumb', '') }],
});

describe('pickPhotos', () => {
  it('returns scenic photo URLs in search order, dropping maps/flags/svg', () => {
    const payload = {
      query: {
        pages: {
          a: page(2, 'File:Oia sunset.jpg', 'https://c/thumb/oia.jpg'),
          b: page(1, 'File:Santorini panorama.jpg', 'https://c/thumb/pano.jpg'),
          c: page(3, 'File:Santorini locator map.svg', 'https://c/thumb/map.svg'),
          d: page(4, 'File:Flag of Greece.svg', 'https://c/thumb/flag.svg'),
        },
      },
    };
    // sorted by index (pano #1, oia #2); map + flag filtered out
    expect(pickPhotos(payload)).toEqual(['https://c/thumb/pano.jpg', 'https://c/thumb/oia.jpg']);
  });

  it('returns [] on an empty or malformed payload', () => {
    expect(pickPhotos({})).toEqual([]);
    expect(pickPhotos(null)).toEqual([]);
    expect(pickPhotos({ query: {} })).toEqual([]);
  });
});
