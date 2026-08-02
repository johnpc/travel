import { useState } from 'react';
import './photoCarousel.css';

interface PhotoCarouselProps {
  photos: string[];
  alt: string;
}

/** A swipeable/scrollable strip of real destination photos with dot indicators.
 * Uses native horizontal scroll-snap (works with touch + trackpad); the dots
 * reflect and jump to each photo. Renders a single image when there's only one,
 * nothing when there are none. */
export function PhotoCarousel({ photos, alt }: PhotoCarouselProps) {
  const [active, setActive] = useState(0);
  if (photos.length === 0) return null;

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="carousel" data-testid="photo-carousel">
      <div className="carousel__track" onScroll={onScroll}>
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
        <div className="carousel__dots" aria-hidden="true">
          {photos.map((src, i) => (
            <span
              key={src}
              className={i === active ? 'carousel__dot carousel__dot--on' : 'carousel__dot'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
