/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE } from "../../../lib/api";
import { Player } from "../../../types";
import { computeAge } from "../../../lib/utils";

export default function PlayerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const playerId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;
    let active = true;
    (async () => {
      try {
        // Primär: Detail-Endpoint, Fallback: Liste filtern (falls Backend GET /players/{id} nicht unterstützt).
        const res = await fetch(`${API_BASE}/players/${playerId}`);
        if (res.ok) {
          const data: Player = await res.json();
          if (active) setPlayer(data);
        } else {
          const list = await fetch(`${API_BASE}/players`).then((r) => r.json());
          const found = Array.isArray(list) ? list.find((p: Player) => p.id === playerId) : null;
          if (found && active) setPlayer(found);
          else throw new Error(`Status ${res.status}`);
        }
      } catch (err) {
        if (!active) return;
        setError("Spieler nicht gefunden.");
      }
    })();
    return () => {
      active = false;
    };
  }, [playerId]);

  const handleDelete = async () => {
    if (!player) return;
    const confirmed = window.confirm(`Soll der Spieler "${player.firstName} ${player.lastName}" wirklich gelöscht werden?`);
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE}/players/${player.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/players");
      } else {
        setError(`Löschen fehlgeschlagen (Status ${res.status}).`);
      }
    } catch (err) {
      setError("Löschen fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Spieler-Detail</h1>
          <p className="text-sm text-slate-300">Stammdaten und Aktionen.</p>
        </div>
        <button onClick={() => router.back()} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:border-[#e10600]/60">
          Zurück
        </button>
      </div>

      <section className="cardish p-5 sm:p-6">
        {error && <div className="mb-3 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}
        {!error && !player && <div className="text-sm text-slate-300">Lädt...</div>}
        {player && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {player.photoData ? (
                  <img src={player.photoData} alt={`${player.firstName} ${player.lastName}`} className="h-14 w-14 rounded-full object-cover border border-white/15" />
                ) : (
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white">
                    {`${player.firstName?.[0] || ""}${player.lastName?.[0] || ""}`.trim().toUpperCase() || "?"}
                  </span>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {player.firstName} {player.lastName}
                  </h2>
                  <div className="text-sm text-slate-300">
                    {player.birthdate} • {computeAge(player.birthdate) ?? "?"} Jahre
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => router.push(`/players/${player.id}/edit`)} className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:border-[#e10600]/60">
                  Bearbeiten
                </button>
                <button onClick={handleDelete} className="rounded-lg border border-red-500/50 px-3 py-2 text-sm font-semibold text-red-100 hover:border-red-400 hover:bg-red-500/10">
                  Löschen
                </button>
              </div>
            </div>
            <div className="grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
              <div><span className="text-slate-400">Nation:</span> {player.nation || "—"}</div>
              <div><span className="text-slate-400">Einsatzland:</span> {player.playsIn || "—"}</div>
              <div><span className="text-slate-400">Verein:</span> {player.club || "—"}</div>
              <div><span className="text-slate-400">Liga:</span> {player.level || "—"}</div>
              <div><span className="text-slate-400">Größe:</span> {player.height || "—"}</div>
              <div><span className="text-slate-400">Fuß:</span> {player.foot || "—"}</div>
            </div>
            {player.note && <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-3 text-sm text-slate-100">{player.note}</div>}
          </div>
        )}
      </section>
    </div>
  );
}
