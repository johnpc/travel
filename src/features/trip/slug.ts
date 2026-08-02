/**
 * Trip slug helpers — pure, unit-tested. A slug is the URL key for a trip
 * (travel.jpc.io/<slug>): lowercase, spaces→hyphens, only [a-z0-9-], collapsed
 * and trimmed hyphens. `slugify` turns a human title into one; `isValidSlug`
 * guards a slug read from the URL.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** A non-empty slug of only lowercase letters, digits, and single hyphens. */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * A friendly display title derived from a slug, for trips opened by a raw URL
 * with no title passed. Hyphens → spaces, Title Case, e.g. "greece-2027" →
 * "Greece 2027". Pure; keeps a bare slug from showing as the giant page title.
 */
export function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
