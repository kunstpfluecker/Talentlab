const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status}${text ? ` – ${text}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchPlayers() {
  return fetchJson(`${API_BASE}/players`);
}

export async function fetchTournaments() {
  return fetchJson(`${API_BASE}/tournaments`);
}

export async function fetchVenues() {
  return fetchJson(`${API_BASE}/venues`);
}

export { API_BASE };
