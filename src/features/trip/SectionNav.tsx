import './sectionNav.css';

const SECTIONS = [
  { id: 'trip-crew', label: "Who's in" },
  { id: 'trip-destinations', label: 'Destinations' },
  { id: 'trip-dates', label: 'Dates' },
  { id: 'trip-chat', label: 'Discussion' },
];

/** A sticky in-page jump bar: the trip page is ~4 screens tall on mobile and the
 * roster/dates sit 3 screens down, so voters/date-markers had to scroll blindly
 * past everything. Tapping a chip smooth-scrolls to that section. Ionic scrolls
 * inside ion-content's shadow .inner-scroll, so scrollIntoView on the anchor
 * (which bubbles to that scroller) is the reliable jump. */
export function SectionNav() {
  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <nav className="secnav" data-testid="section-nav" aria-label="Jump to section">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          className="secnav__chip"
          data-testid={`secnav-${s.id}`}
          onClick={() => jump(s.id)}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}
