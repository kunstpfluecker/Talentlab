import { useEffect, useState } from "react";
import { loadAll } from "../lib/loaders";
import { Player, Tournament, Venue } from "../types";

type UseInitialDataArgs = {
  setPlayers: (p: Player[]) => void;
  setTournaments: (t: Tournament[]) => void;
  setVenues: (v: Venue[]) => void;
  setSelectedTournamentId: (id: string) => void;
  setVenueForm: (v: Venue) => void;
  venueFormId: string;
};

export function useInitialData(args: UseInitialDataArgs) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadAll(args)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Laden fehlgeschlagen");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loading, error, setError };
}
