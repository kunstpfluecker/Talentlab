/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE } from "../../../lib/api";
import { Venue } from "../../../types";

export default function VenueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const venueId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id[0] : "";
  const [venue, setVenue] = useState<Venue | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!venueId) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/venues/${venueId}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: Venue = await res.json();
        if (active) setVenue(data);
      } catch (err) {
        if (active) setError("Ort nicht gefunden.");
      }
    })();
    return () => {
      active = false;
    };
  }, [venueId]);

  const handleDelete = async () => {
    if (!venue) return;
    const confirmed = window.confirm(`Soll der Austragungsort "${venue.name}" wirklich gelöscht werden?`);
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE}/venues/${venue.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/venues");
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
          <h1 className="text-2xl font-bold text-white">Austragungsort</h1>
          <p className="text-sm text-slate-300">Stammdaten und Plätze.</p>
        </div>
        <Link href="/venues" className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:border-[#e10600]/60">
          Zurück zur Übersicht
        </Link>
      </div>

      <section className="cardish p-5 sm:p-6">
        {error && <div className="mb-3 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}
        {!error && !venue && <div className="text-sm text-slate-300">Lädt...</div>}
        {venue && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">{venue.name}</h2>
                <div className="text-sm text-slate-300">{venue.address || venue.homeClub || "—"}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => router.push(`/venues/${venue.id}/edit`)} className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:border-[#e10600]/60">
                  Bearbeiten
                </button>
                <button onClick={handleDelete} className="rounded-lg border border-red-500/50 px-3 py-2 text-sm font-semibold text-red-100 hover:border-red-400 hover:bg-red-500/10">
                  Löschen
                </button>
              </div>
            </div>
            <div className="grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
              <div><span className="text-slate-400">Heimatverein:</span> {venue.homeClub || "—"}</div>
              <div><span className="text-slate-400">Kontakt:</span> {venue.contact || "—"}</div>
              <div><span className="text-slate-400">Mietpreis:</span> {venue.price || "—"}</div>
            </div>
            {venue.note && <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-3 text-sm text-slate-100">{venue.note}</div>}
            {venue.photoData && <img src={venue.photoData} alt={venue.name} className="h-32 w-32 rounded-lg object-cover border border-white/10" />}
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="mb-2 text-xs uppercase tracking-[0.12em] text-slate-300">Plätze</p>
              {venue.pitches?.length ? (
                <div className="flex flex-wrap gap-2">
                  {venue.pitches.map((p) => (
                    <span key={p.id || p.label} className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs text-white">
                      {p.label} • {p.surface || "?"}{p.lights ? " • Flutlicht" : ""}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-300">Keine Plätze hinterlegt.</div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
