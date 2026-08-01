import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { slugify } from '../trip/slug';

/**
 * Home-screen logic: turn a typed trip name into a slug and navigate to its
 * URL (travel.jpc.io/<slug>), where the trip is opened or created. Kept out of
 * the view so it's unit-testable.
 */
export function useStartTrip() {
  const history = useHistory();
  const [name, setName] = useState('');
  const slug = slugify(name);
  const canStart = slug.length > 0;

  const start = () => {
    if (!canStart) return;
    // Carry the typed title so the trip is created with a nice name, not the slug.
    history.push(`/${slug}`, { title: name.trim() });
  };

  return { name, setName, slug, canStart, start };
}
