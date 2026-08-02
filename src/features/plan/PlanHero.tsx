interface PlanHeroProps {
  /** Resolved photo URL, or undefined while it's still loading. */
  src?: string | null;
  alt: string;
}

/** The plan card's hero photo. Renders the image once its URL resolves, else a
 * fixed-height placeholder that reserves the same space — so the card body never
 * jumps down when the photo arrives (keeps layout shift near zero). */
export function PlanHero({ src, alt }: PlanHeroProps) {
  if (src) {
    return <img className="plan__hero" src={src} alt={alt} data-testid="plan-hero" />;
  }
  return <div className="plan__hero plan__hero--placeholder" aria-hidden="true" />;
}
