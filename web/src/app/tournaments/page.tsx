/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState } from "react";
import { useTournaments } from "../../hooks/useTournaments";
import { API_BASE } from "../../lib/api";

export default function TournamentsListPage() {
  const { data: tournaments, loading, error, refresh } = useTournaments();
  const [search, setSearch] = useState("");

  const filtered = tournaments.filter((t) => `${t.name} ${t.venue?.name || ""}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Turniere</h1>
          <p className="text-sm text-slate-300">Übersicht deiner Scouting-Events.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/tournaments/new"
            className="rounded-lg bg-gradient-to-r from-[#e10600] to-[#b00012] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(225,6,0,0.35)]"
          >
            Turnier anlegen
          </Link>
        </div>
      </div>

      <section className="cardish p-5 sm:p-6">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            placeholder="Turnier oder Austragungsort suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-[#e10600]/60 sm:w-1/2"
          />
          <span className="pill">{filtered.length} Turniere</span>
        </div>
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-200 shadow-lg">Lädt Turniere...</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                <div>
                  <div className="text-white font-semibold">{t.name}</div>
                  <div className="text-sm text-slate-300">
                    {t.venue?.name || "—"} {t.start ? `• ${t.start}` : ""} {t.end ? `– ${t.end}` : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/tournaments/${t.id}`} className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-white hover:border-[#e10600]/60">
                    Details
                  </Link>
                  <Link href={`/tournaments/${t.id}/edit`} className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-white hover:border-[#e10600]/60">
                    Bearbeiten
                  </Link>
                  <button
                    onClick={async () => {
                      const ok = window.confirm(`Turnier "${t.name}" löschen?`);
                      if (!ok) return;
                      const res = await fetch(`${API_BASE}/tournaments/${t.id}`, { method: "DELETE" });
                      if (res.ok) {
                        await refresh();
                      }
                    }}
                    className="rounded-lg border border-red-500/50 px-3 py-1 text-xs font-semibold text-red-100 hover:border-red-400 hover:bg-red-500/10"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
            {!filtered.length && <div className="text-sm text-slate-300">Keine Turniere gefunden.</div>}
            {error && <div className="text-sm text-red-200">Laden fehlgeschlagen: {error}</div>}
          </div>
        )}
      </section>
    </div>
  );
}
