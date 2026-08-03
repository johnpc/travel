import { useState } from 'react';
import { IonButton, IonChip, IonInput, IonLabel } from '@ionic/react';
import type { MemberRecord } from '../../lib/dataClient';
import './roster.css';

interface RosterProps {
  members: MemberRecord[];
  me: string | null;
  onJoin: (name: string) => void;
  onPick: (name: string) => void;
  isJoining: boolean;
}

/** The trip roster: existing members as pickable chips + a join-by-name form.
 * Name-only identity — tapping your name (or joining a new one) is your login. */
export function Roster({ members, me, onJoin, onPick, isJoining }: RosterProps) {
  const [name, setName] = useState('');
  return (
    <section className="roster" id="trip-crew" data-testid="roster">
      <h2 className="tv-kicker tv-section-title">Who's in</h2>
      <div className="roster__chips">
        {members.map((m) => (
          <IonChip
            key={m.id}
            data-testid="roster-member"
            className={m.name === me ? 'roster__chip roster__chip--me' : 'roster__chip'}
            onClick={() => onPick(m.name)}
          >
            <IonLabel>{m.name}</IonLabel>
          </IonChip>
        ))}
      </div>
      {me ? (
        <p className="tv-muted roster__you" data-testid="roster-you">
          You're planning as <strong>{me}</strong>.
        </p>
      ) : (
        <form
          className="roster__form"
          data-testid="join-form"
          onSubmit={(e) => {
            e.preventDefault();
            onJoin(name);
            setName('');
          }}
        >
          <IonInput
            label="Your name"
            labelPlacement="stacked"
            placeholder="Add yourself"
            value={name}
            data-testid="join-name"
            onIonInput={(e) => setName(e.detail.value ?? '')}
          />
          <IonButton type="submit" disabled={!name.trim() || isJoining} data-testid="join-trip">
            {isJoining ? 'Joining…' : 'Join'}
          </IonButton>
        </form>
      )}
    </section>
  );
}
