import { Roster } from './Roster';
import { DestinationsPanel } from '../destinations/DestinationsPanel';
import { ItinerarySection } from '../itinerary/ItinerarySection';
import { ChatSection } from '../chat/ChatSection';
import { AvailabilityPanel } from '../availability/AvailabilityPanel';
import type { MemberRecord, TripRecord } from '../../lib/dataClient';
import type { useJoinTrip } from './useJoinTrip';

interface TripColumnsProps {
  trip: TripRecord | null | undefined;
  members: MemberRecord[];
  join: ReturnType<typeof useJoinTrip>;
  start: { year: number; month: number; day: number };
}

/** The trip's two-column body: the brainstorm board (destinations → itinerary →
 * discussion) in the main column, and the roster + availability calendar in the
 * side rail. Extracted so TripPage stays within the line limit. */
export function TripColumns({ trip, members, join, start }: TripColumnsProps) {
  const title = trip?.title ?? '';
  return (
    <div className="trip__cols">
      <div className="trip__main">
        <DestinationsPanel
          tripId={trip?.id}
          tripTitle={title}
          me={join.me}
          memberCount={members.length}
        />
        <ItinerarySection tripId={trip?.id} tripTitle={title} />
        <ChatSection tripId={trip?.id} me={join.me} />
      </div>
      <aside className="trip__rail">
        <Roster
          members={members}
          me={join.me}
          onJoin={join.join}
          onPick={join.pick}
          isJoining={join.isJoining}
        />
        <AvailabilityPanel
          tripId={trip?.id}
          me={join.me}
          start={start}
          memberCount={members.length}
        />
      </aside>
    </div>
  );
}
