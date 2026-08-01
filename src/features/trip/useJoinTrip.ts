import { useEffect, useState } from 'react';
import { readIdentity, saveIdentity } from '../identity/identityStore';
import { useAddMember } from './memberApi';
import type { MemberRecord } from '../../lib/dataClient';

/**
 * Join-a-trip logic: track who THIS device is (name-only identity), and add a
 * new name to the roster. The identity is remembered locally for auto-select on
 * return, but the roster itself is the server source of truth. If the saved
 * name is already on the roster we adopt it silently; joining a new name adds a
 * Member and remembers it.
 */
export function useJoinTrip(slug: string, tripId: string | undefined, members: MemberRecord[]) {
  const [me, setMe] = useState<string | null>(null);
  const addMember = useAddMember(tripId);

  // Auto-select the remembered name once it appears on the roster.
  useEffect(() => {
    const saved = readIdentity(slug, window.localStorage);
    if (saved && members.some((m) => m.name === saved)) setMe(saved);
  }, [slug, members]);

  const join = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = members.find((m) => m.name === trimmed);
    if (!existing) await addMember.mutateAsync(trimmed);
    saveIdentity(slug, trimmed, window.localStorage);
    setMe(trimmed);
  };

  const pick = (name: string) => {
    saveIdentity(slug, name, window.localStorage);
    setMe(name);
  };

  return { me, join, pick, isJoining: addMember.isPending };
}
