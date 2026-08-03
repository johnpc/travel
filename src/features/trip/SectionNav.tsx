import { useActiveSection } from './useActiveSection';
import { scrollToId } from '../../lib/scrollToId';
import './sectionNav.css';

const SECTIONS = [
  { id: 'trip-crew', label: "Who's in" },
  { id: 'trip-destinations', label: 'Destinations' },
  { id: 'trip-dates', label: 'Dates' },
  { id: 'trip-chat', label: 'Discussion' },
];

const IDS = SECTIONS.map((s) => s.id);

/** A sticky in-page jump bar: the trip page is ~4 screens tall on mobile and the
 * roster/dates sit 3 screens down, so voters/date-markers had to scroll blindly
 * past everything. Tapping a chip smooth-scrolls to that section; a scroll-spy
 * highlights the section you're in ("you are here" + confirms a jump landed).
 * Ionic scrolls inside ion-content's shadow .inner-scroll, so scrollIntoView on
 * the anchor (which bubbles to that scroller) is the reliable jump. */
export function SectionNav() {
  const active = useActiveSection(IDS);
  return (
    <nav className="secnav" data-testid="section-nav" aria-label="Jump to section">
      {SECTIONS.map((s) => {
        const on = active === s.id;
        return (
          <button
            key={s.id}
            type="button"
            className={on ? 'secnav__chip secnav__chip--on' : 'secnav__chip'}
            data-testid={`secnav-${s.id}`}
            aria-current={on ? 'true' : undefined}
            onClick={() => scrollToId(s.id)}
          >
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}
