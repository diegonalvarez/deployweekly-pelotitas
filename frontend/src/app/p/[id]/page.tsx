import { redirect } from 'next/navigation';

/**
 * Short vanity alias — /p/[id] → /players/[id].
 * Real handles (e.g. /p/diegonalvarez) require a User.handle field; deferred.
 */
export default function PlayerVanityPage({ params }: { params: { id: string } }) {
  redirect(`/players/${params.id}`);
}
