import type { InterestLevel } from '../../lib/dataClient';
import { consensusBar, type Tally } from './tally';
import './interest.css';

interface VoteControlProps {
  tally: Tally;
  myLevel: InterestLevel | null;
  canVote: boolean;
  isVoting: boolean;
  onVote: (level: InterestLevel) => void;
  /** Roster size, so the tally can show "N of M voted" (is everyone in yet?). */
  memberCount?: number;
}

const OPTIONS: { level: InterestLevel; label: string; emoji: string }[] = [
  { level: 'YES', label: 'In', emoji: '🙌' },
  { level: 'MAYBE', label: 'Maybe', emoji: '🤔' },
  { level: 'NO', label: 'Pass', emoji: '🙅' },
];

/** Per-destination vote row: a Yes/Maybe/No control (highlighting this member's
 * pick) plus the group tally. Disabled until the visitor picks a name. */
export function VoteControl({
  tally,
  myLevel,
  canVote,
  isVoting,
  onVote,
  memberCount,
}: VoteControlProps) {
  const bar = consensusBar(tally);
  const voted = tally.yes + tally.maybe + tally.no;
  // "N of M voted" tells the crew whether everyone has weighed in yet — only when
  // we know the roster size and it's a plausible denominator.
  const progress = memberCount && memberCount >= voted ? ` · ${voted} of ${memberCount} voted` : '';
  return (
    <div className="vote" data-testid="vote-control">
      <div className="vote__top">
        <div className="vote__buttons" role="group" aria-label="Your interest">
          {OPTIONS.map((o) => (
            <button
              key={o.level}
              type="button"
              className={myLevel === o.level ? 'vote__btn vote__btn--on' : 'vote__btn'}
              aria-pressed={myLevel === o.level}
              disabled={!canVote || isVoting}
              data-testid={`vote-${o.level}`}
              onClick={() => onVote(o.level)}
            >
              <span aria-hidden="true">{o.emoji}</span> {o.label}
            </button>
          ))}
        </div>
        <span className="vote__tally tv-muted" data-testid="vote-tally">
          {tally.yes} in · {tally.maybe} maybe · {tally.no} pass{progress}
        </span>
      </div>
      {bar.total > 0 && (
        <div className="vote__bar" data-testid="vote-bar" aria-hidden="true">
          <span className="vote__seg vote__seg--yes" style={{ width: `${bar.yesPct}%` }} />
          <span className="vote__seg vote__seg--maybe" style={{ width: `${bar.maybePct}%` }} />
          <span className="vote__seg vote__seg--no" style={{ width: `${bar.noPct}%` }} />
        </div>
      )}
    </div>
  );
}
