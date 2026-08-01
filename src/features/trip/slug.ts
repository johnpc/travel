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
