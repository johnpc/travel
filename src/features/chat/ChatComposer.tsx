import { useState } from 'react';
import { IonButton, IonIcon, IonInput } from '@ionic/react';
import { sendOutline } from 'ionicons/icons';

interface ChatComposerProps {
  onSend: (body: string) => void;
  isSending: boolean;
}

/** The message composer: a text field + send. Cleared on submit. Gated on
 * identity by the parent (only shown once you've picked your name). */
export function ChatComposer({ onSend, isSending }: ChatComposerProps) {
  const [body, setBody] = useState('');
  return (
    <form
      className="chat__composer"
      data-testid="chat-composer"
      onSubmit={(e) => {
        e.preventDefault();
        onSend(body);
        setBody('');
      }}
    >
      <IonInput
        className="chat__field"
        fill="outline"
        aria-label="Write a message"
        placeholder="Say something to the crew…"
        value={body}
        data-testid="chat-input"
        onIonInput={(e) => setBody(e.detail.value ?? '')}
      />
      <IonButton type="submit" disabled={!body.trim() || isSending} data-testid="chat-send">
        <IonIcon icon={sendOutline} slot="icon-only" aria-hidden="true" />
      </IonButton>
    </form>
  );
}
