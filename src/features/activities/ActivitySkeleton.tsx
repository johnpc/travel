import { Skeleton } from '../shell/Skeleton';

interface ActivitySkeletonProps {
  /** How many placeholder cards to preview (default 3, a typical AI batch). */
  count?: number;
}

/** Preview cards shown while the AI drafts activity ideas — shaped like the real
 * suggestion items (category + title + blurb) so the multi-second wait feels
 * purposeful and on-brand instead of an idle empty state. Loading affordance. */
export function ActivitySkeleton({ count = 3 }: ActivitySkeletonProps) {
  return (
    <ul
      className="acts__suggestions"
      aria-busy="true"
      aria-label="Dreaming up things to do"
      data-testid="act-loading"
    >
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="acts__suggestion acts__suggestion--skeleton">
          <div className="acts__skeleton-body">
            <Skeleton width="34%" height="0.62rem" />
            <Skeleton width="60%" height="0.92rem" />
            <Skeleton width="90%" height="0.82rem" />
          </div>
        </li>
      ))}
    </ul>
  );
}
