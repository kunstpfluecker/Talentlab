import { useEffect, useState, useCallback } from "react";
import { Player } from "../types";
import { API_BASE } from "../lib/api";

type UsePlayersResult = {
  data: Player[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function usePlayers(): UsePlayersResult {
  const [data, setData] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/players`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const payload: Player[] = await res.json();
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
