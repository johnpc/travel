import { useState } from 'react';
import { IonButton, IonInput } from '@ionic/react';

interface WelcomeJoinProps {
  onJoin: (name: string) => void;
  isJoining: boolean;
}

/** Inline "add your name" right where the welcome banner asks for it — so the
 * bold #1 step is actionable on the spot, not ~a screen away in the side rail. */
export function WelcomeJoin({ onJoin, isJoining }: WelcomeJoinProps) {
  const [name, setName] = useState('');
  return (
    <form
      className="welcome__join"
      data-testid="welcome-join"
      onSubmit={(e) => {
        e.preventDefault();
        onJoin(name);
        setName('');
      }}
    >
      <IonInput
        className="welcome__join-field"
        fill="outline"
        label="Your name"
        labelPlacement="stacked"
        placeholder="Add yourself"
        value={name}
        data-testid="welcome-join-name"
        onIonInput={(e) => setName(e.detail.value ?? '')}
      />
      <IonButton type="submit" disabled={!name.trim() || isJoining} data-testid="welcome-join-btn">
        Join
      </IonButton>
    </form>
  );
}
