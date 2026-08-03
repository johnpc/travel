import { Skeleton } from '../shell/Skeleton';
import './budget.css';

interface HotelSkeletonProps {
  /** How many placeholder cards to preview (default 3 — one per price tier). */
  count?: number;
}

/** Preview cards shown while the AI finds hotel picks — shaped like the real
 * HotelCard (tier + price row, area, a pro/con line) so the multi-second wait
 * previews the layout instead of an empty gap. Loading affordance. */
export function HotelSkeleton({ count = 3 }: HotelSkeletonProps) {
  return (
    <ul
      className="hotels__list"
      aria-busy="true"
      aria-label="Finding places to stay"
      data-testid="hotels-loading"
    >
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="hotel">
          <div className="hotel__head">
            <Skeleton width="28%" height="0.7rem" />
            <Skeleton width="22%" height="0.9rem" />
          </div>
          <Skeleton width="45%" height="0.8rem" />
          <Skeleton width="88%" height="0.75rem" />
        </li>
      ))}
    </ul>
  );
}
