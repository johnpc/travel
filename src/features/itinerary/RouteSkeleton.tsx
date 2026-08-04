import { Skeleton } from '../shell/Skeleton';

interface RouteSkeletonProps {
  /** How many placeholder legs to preview (default 3 — a typical AI route). */
  count?: number;
}

/** Preview cards shown while the AI plans a route — shaped like the real route
 * suggestions (place + nights + a note line) so the multi-second wait previews
 * the layout instead of an empty gap. Loading affordance. */
export function RouteSkeleton({ count = 3 }: RouteSkeletonProps) {
  return (
    <ul
      className="itin__suggestions"
      aria-busy="true"
      aria-label="Planning a route"
      data-testid="route-loading"
    >
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="itin__suggestion">
          <div className="itin__suggestion-body">
            <Skeleton width="52%" height="0.95rem" />
            <Skeleton width="30%" height="0.8rem" />
            <Skeleton width="85%" height="0.8rem" />
          </div>
        </li>
      ))}
    </ul>
  );
}
