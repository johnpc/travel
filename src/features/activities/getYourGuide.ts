/**
 * Build a GetYourGuide SEARCH URL for an activity at a destination. We link to a
 * search (not a specific listing) so the URL always resolves to real, current
 * experiences — never a hallucinated/dead product page. Pure + unit-tested.
 */
export function getYourGuideUrl(destinationName: string, activityTitle: string): string {
  const q = `${activityTitle} ${destinationName}`.trim();
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(q)}`;
}
