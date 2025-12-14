/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState } from "react";
import { useVenues } from "../../hooks/useVenues";

export default function VenuesListPage() {
  const { data: venues, loading, error } = useVenues();
  const [search, setSearch] = useState("");

  const filtered = venues.filter((v) => `${v.name} ${v.address || ""} ${v.homeClub || ""}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Austragungsorte</h1>
          <p className="text-sm text-slate-300">Sportanlagen, Plätze und Kontakte.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/venues/new"
            className="rounded-lg bg-gradient-to-r from-[#e10600] to-[#b00012] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(225,6,0,0.35)]"
          >
            Ort anlegen
          </Link>
        </div>
      </div>

      <section className="cardish p-5 sm:p-6">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            placeholder="Name oder Adresse suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-[#e10600]/60 sm:w-1/2"
          />
          <span className="pill">{filtered.length} Orte</span>
        </div>
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-200 shadow-lg">Lädt Austragungsorte...</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((v) => (
              <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                <div>
                  <div className="text-white font-semibold">{v.name}</div>
                  <div className="text-sm text-slate-300">{v.address || v.homeClub || "—"}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/venues/${v.id}`} className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-white hover:border-[#e10600]/60">
                    Details
                  </Link>
                  <Link href={`/venues/${v.id}/edit`} className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-white hover:border-[#e10600]/60">
                    Bearbeiten
                  </Link>
                </div>
              </div>
            ))}
            {!filtered.length && <div className="text-sm text-slate-300">Keine Orte gefunden.</div>}
            {error && <div className="text-sm text-red-200">Laden fehlgeschlagen: {error}</div>}
          </div>
        )}
      </section>
    </div>
  );
}
