import { Skeleton } from '../shell/Skeleton';

interface SuggestionSkeletonProps {
  /** How many placeholder cards to preview (default 3, matching a typical batch). */
  count?: number;
}

/** Preview cards shown while the AI drafts destination ideas — shaped like the
 * real suggestion items (name + blurb + why) so the multi-second wait feels
 * purposeful and on-brand instead of a bare spinner. Purely a loading affordance. */
export function SuggestionSkeleton({ count = 3 }: SuggestionSkeletonProps) {
  return (
    <ul
      className="suggest__list"
      aria-busy="true"
      aria-label="Dreaming up destinations"
      data-testid="suggest-loading"
    >
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="suggest__item suggest__item--skeleton">
          <div className="suggest__body">
            <Skeleton width="46%" height="1.05rem" />
            <Skeleton width="92%" height="0.9rem" />
            <Skeleton width="74%" height="0.9rem" />
          </div>
        </li>
      ))}
    </ul>
  );
}
