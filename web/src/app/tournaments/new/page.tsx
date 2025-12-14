/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../../../lib/api";
import { Player, Venue } from "../../../types";

export default function NewTournamentPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantSearch, setParticipantSearch] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venueSearch, setVenueSearch] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/players`)
      .then((res) => res.json())
      .then((data) => setPlayers(data || []))
      .catch(() => setPlayers([]));
    fetch(`${API_BASE}/venues`)
      .then((res) => res.json())
      .then((data) => setVenues(data || []))
      .catch(() => setVenues([]));
  }, []);

  const participantSuggestions = useMemo(() => {
    const term = participantSearch.toLowerCase();
    if (!term) return [];
    return players
      .filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(term))
      .filter((p) => !participants.includes(p.id))
      .slice(0, 5);
  }, [participantSearch, players, participants]);

  const venueSuggestions = useMemo(() => {
    const term = venueSearch.toLowerCase();
    if (!term) return [];
    return venues
      .filter((v) => `${v.name} ${v.address || ""}`.toLowerCase().includes(term))
      .slice(0, 5);
  }, [venueSearch, venues]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const startRaw = (data.get("start") as string | null)?.trim() || "";
    const endRaw = (data.get("end") as string | null)?.trim() || "";
    if (startRaw && endRaw && new Date(endRaw) < new Date(startRaw)) {
      setFeedback("Ende darf nicht vor Start liegen.");
      return;
    }
    const payload = {
      name: (data.get("name") as string | null)?.trim() || "",
      country: "",
      start: startRaw || null,
      end: endRaw || null,
      note: (data.get("note") as string | null)?.trim() || "",
      venueId: selectedVenueId || null,
      participants,
    };
    try {
      const res = await fetch(`${API_BASE}/tournaments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        router.push(`/tournaments/${saved.id}`);
      } else {
        setFeedback(`Speichern fehlgeschlagen (Status ${res.status}).`);
      }
    } catch (err) {
      setFeedback("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Turnier anlegen</h1>
          <p className="text-sm text-slate-300">Name, Zeitraum, Land und Notizen.</p>
        </div>
        <button onClick={() => router.back()} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:border-[#e10600]/60">
          Zurück
        </button>
      </div>

      <section className="cardish p-5 sm:p-6">
        {feedback && <div className="mb-3 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-100">{feedback}</div>}
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Name *
            <input name="name" required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Start
            <input name="start" type="date" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Ende
            <input name="end" type="date" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300 md:col-span-2">
            Notizen
            <textarea name="note" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
          </label>
          <div className="md:col-span-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Austragungsort</span>
              {selectedVenueId && (
                <span className="pill">
                  {venues.find((v) => v.id === selectedVenueId)?.name || "gewählt"}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                placeholder="Ort suchen..."
                value={venueSearch}
                onChange={(e) => {
                  setVenueSearch(e.target.value);
                  setShowVenueSuggestions(!!e.target.value);
                }}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-[#e10600]/60"
              />
              {showVenueSuggestions && venueSearch && venueSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-[#0f0f12] shadow-lg max-h-48 overflow-auto">
                  {venueSuggestions.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVenueId(v.id);
                        setVenueSearch(v.name);
                        setShowVenueSuggestions(false);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/5"
                    >
                      <span>{v.name}</span>
                      <span className="text-[11px] text-slate-400">{v.address || ""}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Teilnehmende Spieler</span>
              <span className="pill">{participants.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {participants.map((id) => {
                const p = players.find((pl) => pl.id === id);
                return (
                  <span key={id} className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs text-white">
                    {p ? `${p.firstName} ${p.lastName}` : id}
                    <button
                      className="ml-2 text-red-200"
                      onClick={() => setParticipants((prev) => prev.filter((x) => x !== id))}
                      type="button"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
              {!participants.length && <span className="text-xs text-slate-300">Noch keine Spieler hinzugefügt.</span>}
            </div>
            <div className="relative">
              <input
                placeholder="Spieler suchen..."
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-[#e10600]/60"
              />
              {participantSearch && participantSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-[#0f0f12] shadow-lg">
                  {participantSuggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setParticipants((prev) => [...prev, p.id]);
                        setParticipantSearch("");
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/5"
                    >
                      <span>{p.firstName} {p.lastName}</span>
                      <span className="text-[11px] text-slate-400">{p.position || ""}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => router.back()} className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:border-[#e10600]/60">
              Abbrechen
            </button>
            <button type="submit" className="rounded-lg bg-gradient-to-r from-[#e10600] to-[#b00012] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(225,6,0,0.35)]">
              Turnier speichern
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
