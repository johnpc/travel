import { useState } from 'react';
import { IonButton, IonInput } from '@ionic/react';

interface AddDestinationProps {
  onAdd: (name: string) => void;
  isAdding: boolean;
}

/** Manual add: type a destination name and add it to the trip's brainstorm. */
export function AddDestination({ onAdd, isAdding }: AddDestinationProps) {
  const [name, setName] = useState('');
  return (
    <form
      className="dest-add"
      data-testid="dest-add-form"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(name);
        setName('');
      }}
    >
      <IonInput
        label="Add a destination"
        labelPlacement="stacked"
        placeholder="Lisbon, Portugal"
        value={name}
        data-testid="dest-name"
        onIonInput={(e) => setName(e.detail.value ?? '')}
      />
      <IonButton type="submit" disabled={!name.trim() || isAdding} data-testid="dest-add">
        Add
      </IonButton>
    </form>
  );
}
