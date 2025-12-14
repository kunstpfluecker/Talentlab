import { useEffect, useState, useCallback } from "react";
import { Tournament } from "../types";
import { API_BASE } from "../lib/api";

type UseTournamentsResult = {
  data: Tournament[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useTournaments(): UseTournamentsResult {
  const [data, setData] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tournaments`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const payload: Tournament[] = await res.json();
      setData(Array.isArray(payload) ? payload : []);
    } catch (err: any) {
      setError(err?.message || "Laden fehlgeschlagen");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
