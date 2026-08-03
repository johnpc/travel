import { useRef, useState } from 'react';
import './photoCarousel.css';

interface PhotoCarouselProps {
  photos: string[];
  alt: string;
}

/** A swipeable/scrollable strip of real destination photos with dot controls.
 * Uses native horizontal scroll-snap (works with touch + trackpad); the dots
 * reflect the current photo AND jump to one on click/keyboard — the only way a
 * mouse-only desktop user can browse past the first photo. Renders a single
 * image when there's one, nothing when there are none. */
export function PhotoCarousel({ photos, alt }: PhotoCarouselProps) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  if (photos.length === 0) return null;

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const jumpTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="carousel" data-testid="photo-carousel">
      <div
        className="carousel__track"
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={0}
        role="group"
        aria-label={`${alt} photos — scroll to browse`}
      >
        {photos.map((src, i) => (
          <img
            key={src}
            className="carousel__img"
            src={src}
            alt={`${alt} (${i + 1} of ${photos.length})`}
            loading="lazy"
            data-testid="carousel-photo"
          />
        ))}
      </div>
      {photos.length > 1 && (
        <div className="carousel__dots">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              className={i === active ? 'carousel__dot carousel__dot--on' : 'carousel__dot'}
              aria-label={`View photo ${i + 1} of ${photos.length}`}
              aria-current={i === active}
              data-testid="carousel-dot"
              onClick={() => jumpTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
