"use client";

import Link from "next/link";
import { StatCard } from "../../components/ui";
import { usePlayers } from "../../hooks/usePlayers";
import { useTournaments } from "../../hooks/useTournaments";
import { useVenues } from "../../hooks/useVenues";

export default function DashboardPage() {
  const { data: players } = usePlayers();
  const { data: tournaments } = useTournaments();
  const { data: venues } = useVenues();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-300">Schneller Überblick und Sprungpunkte.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/players/new" className="rounded-lg bg-gradient-to-r from-[#e10600] to-[#b00012] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(225,6,0,0.35)]">
            Spieler anlegen
          </Link>
          <Link href="/tournaments/new" className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white hover:border-[#e10600]/60">
            Turnier anlegen
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Spieler" value={players.length} />
        <StatCard label="Turniere" value={tournaments.length} />
        <StatCard label="Austragungsorte" value={venues.length} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="cardish space-y-3 p-4">
          <div className="text-sm font-semibold text-white">Schnellzugriff</div>
          <div className="grid gap-2 text-sm text-white">
            <Link className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:border-[#e10600]/60" href="/players">
              Spieler Übersicht
            </Link>
            <Link className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:border-[#e10600]/60" href="/tournaments">
              Turniere Übersicht
            </Link>
            <Link className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:border-[#e10600]/60" href="/venues">
              Austragungsorte Übersicht
            </Link>
            <Link className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:border-[#e10600]/60" href="/admin">
              Admin / Scripts
            </Link>
          </div>
        </div>

        <div className="cardish space-y-3 p-4">
          <div className="text-sm font-semibold text-white">Neueste Turniere</div>
          <div className="space-y-2">
            {tournaments.slice(0, 4).map((t) => (
              <Link key={t.id} href={`/tournaments/${t.id}`} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:border-[#e10600]/60">
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-slate-300">{t.start || "ohne Datum"}</div>
                </div>
                <span className="text-[11px] uppercase tracking-[0.1em] text-slate-300">Details →</span>
              </Link>
            ))}
            {!tournaments.length && <div className="text-xs text-slate-300">Noch keine Turniere erfasst.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
