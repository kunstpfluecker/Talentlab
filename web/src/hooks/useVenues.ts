import { useEffect, useState, useCallback } from "react";
import { Venue } from "../types";
import { API_BASE } from "../lib/api";

type UseVenuesResult = {
  data: Venue[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useVenues(): UseVenuesResult {
  const [data, setData] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/venues`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const payload: Venue[] = await res.json();
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
