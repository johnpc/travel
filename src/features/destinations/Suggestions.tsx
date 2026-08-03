import { IonButton, IonIcon } from '@ionic/react';
import { sparklesOutline, addOutline } from 'ionicons/icons';
import { SuggestionSkeleton } from './SuggestionSkeleton';
import type { Suggestion } from './suggestApi';

interface SuggestionsProps {
  suggestions: Suggestion[];
  isLoading: boolean;
  isError?: boolean;
  onSuggest: () => void;
  onAccept: (s: Suggestion) => void;
}

/** The AI panel: a button to fetch destination ideas, then each suggestion with
 * its blurb + why and an "Add to trip" action that accepts it into the board.
 * On a failed AI call, shows a friendly retryable message (the button re-runs). */
export function Suggestions({
  suggestions,
  isLoading,
  isError,
  onSuggest,
  onAccept,
}: SuggestionsProps) {
  // prettier-ignore
  return (
    <section className="suggest" data-testid="suggest">
      <IonButton
        expand="block"
        fill="outline"
        onClick={onSuggest}
        disabled={isLoading}
        data-testid="suggest-btn"
      >
        <IonIcon icon={sparklesOutline} slot="start" aria-hidden="true" />
        {isLoading ? 'Thinking…' : 'Suggest destinations with AI'}
      </IonButton>
      {isError && !isLoading && (
        <p className="suggest__error tv-muted" data-testid="suggest-error">
          The AI couldn’t suggest right now — tap to try again.
        </p>
      )}
      {isLoading && <SuggestionSkeleton />}
      {suggestions.length > 0 && (
        <ul className="suggest__list" data-testid="suggest-list">
          {suggestions.map((s) => (
            <li key={s.name} className="suggest__item" data-testid="suggest-item">
              <div className="suggest__body">
                <span className="suggest__name tv-serif" data-testid="suggest-item-name">
                  {s.name}
                </span>
                <p className="suggest__blurb">{s.blurb}</p>
                <p className="suggest__why tv-muted">{s.why}</p>
              </div>
              <IonButton
                size="small"
                onClick={() => onAccept(s)}
                data-testid="suggest-accept"
                aria-label={`Add ${s.name} to the trip`}
              >
                <IonIcon icon={addOutline} slot="icon-only" aria-hidden="true" />
              </IonButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
