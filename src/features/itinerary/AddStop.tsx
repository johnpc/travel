import { useState } from 'react';
import { IonButton, IonInput } from '@ionic/react';

interface AddStopProps {
  onAdd: (place: string, nights?: number | null) => void;
  isAdding: boolean;
}

/** Add a stop by hand: a place + optional nights. Clears on submit. */
export function AddStop({ onAdd, isAdding }: AddStopProps) {
  const [place, setPlace] = useState('');
  const [nights, setNights] = useState('');
  return (
    <form
      className="itin__add"
      data-testid="stop-add-form"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(place, nights.trim() === '' ? null : Number(nights));
        setPlace('');
        setNights('');
      }}
    >
      <IonInput
        className="itin__field"
        fill="outline"
        label="Add a stop"
        labelPlacement="stacked"
        placeholder="e.g. Bangkok, Thailand"
        value={place}
        data-testid="stop-place"
        onIonInput={(e) => setPlace(e.detail.value ?? '')}
      />
      <IonInput
        className="itin__field itin__field--nights"
        type="number"
        fill="outline"
        label="Nights"
        labelPlacement="stacked"
        inputmode="numeric"
        value={nights}
        data-testid="stop-nights"
        onIonInput={(e) => setNights(e.detail.value ?? '')}
      />
      <IonButton
        type="submit"
        size="small"
        disabled={!place.trim() || isAdding}
        data-testid="stop-add"
      >
        {isAdding ? 'Adding…' : 'Add'}
      </IonButton>
    </form>
  );
}
