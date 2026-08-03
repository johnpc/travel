/**
 * Split a chat message into plain-text and URL segments so the UI can render
 * http(s) links as real anchors while everything else stays text. Pure + tested.
 *
 * Only `http://` / `https://` URLs become links — never `javascript:`/`data:` or
 * bare words — so a pasted Airbnb/flight link is tappable without opening an XSS
 * hole (the renderer emits anchors from these segments, never raw HTML).
 */
export interface TextSegment {
  type: 'text' | 'link';
  value: string;
}

// http(s) URL up to the first whitespace; trailing sentence punctuation is
// trimmed back out so "…lock it in (see https://x.com/a)." doesn't eat the ")."
const URL_RE = /https?:\/\/[^\s]+/gi;
const TRAILING = /[.,!?;:)\]}'"]+$/;

export function linkifySegments(body: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let last = 0;
  for (const m of body.matchAll(URL_RE)) {
    const start = m.index ?? 0;
    let url = m[0];
    const trimmed = url.match(TRAILING)?.[0] ?? '';
    url = url.slice(0, url.length - trimmed.length);
    if (start > last) segments.push({ type: 'text', value: body.slice(last, start) });
    segments.push({ type: 'link', value: url });
    if (trimmed) segments.push({ type: 'text', value: trimmed });
    last = start + m[0].length;
  }
  if (last < body.length) segments.push({ type: 'text', value: body.slice(last) });
  return segments;
}
