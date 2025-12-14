"use client";

import Link from "next/link";
import { useState } from "react";
import { API_BASE } from "../../lib/api";

type SeedEntity = "players" | "venues";

export default function AdminPage() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [entity, setEntity] = useState<SeedEntity>("players");
  const [count, setCount] = useState<number>(25);

  const runSeed = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, count }),
      });
      if (res.ok) {
        setMessage(`Seed für ${entity} mit ${count} Datensätzen ausgeführt.`);
      } else {
        setMessage(`Fehlgeschlagen (Status ${res.status}).`);
      }
    } catch (err) {
      setMessage("Fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Adminbereich</h1>
          <p className="text-sm text-slate-300">Einfacher Script-Launcher.</p>
        </div>
        <Link href="/dashboard" className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:border-[#e10600]/60">
          Zurück
        </Link>
      </div>

      <div className="cardish space-y-3 p-4">
        <div className="text-sm font-semibold text-white">Scripts</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-slate-300">
            Entität
            <select
              value={entity}
              onChange={(e) => setEntity(e.target.value as SeedEntity)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#e10600]/60"
            >
              <option value="players">Spieler</option>
              <option value="venues">Austragungsorte</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-300">
            Anzahl
            <input
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={(e) => setCount(Number(e.target.value) || 0)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#e10600]/60"
            />
          </label>
        </div>
        <button
          onClick={runSeed}
          disabled={loading || count < 1}
          className="rounded-lg bg-gradient-to-r from-[#e10600] to-[#b00012] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(225,6,0,0.35)] disabled:opacity-50"
        >
          Seed ausführen
        </button>
        <div className="pt-4">
          <div className="text-sm font-semibold text-white">Duplikate bereinigen</div>
          <p className="text-xs text-slate-300">Entfernt doppelte Spieler (gleicher Vor- und Nachname, behält ältesten).</p>
          <button
            onClick={async () => {
              setLoading(true);
              setMessage("");
              try {
                const res = await fetch(`${API_BASE}/ops/dedupe-players`, { method: "POST" });
                if (res.ok) {
                  const data = await res.json();
                  setMessage(`Bereinigt: ${data.removed} entfernt, ${data.kept} behalten.`);
                } else {
                  setMessage(`Bereinigen fehlgeschlagen (Status ${res.status}).`);
                }
              } catch (err) {
                setMessage("Bereinigen fehlgeschlagen.");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="mt-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white hover:border-[#e10600]/60 disabled:opacity-50"
          >
            Spieler-Duplikate entfernen
          </button>
        </div>
        {message && <div className="text-xs text-slate-200">{message}</div>}
      </div>
    </div>
  );
}
