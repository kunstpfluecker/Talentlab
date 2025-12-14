/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE } from "../../../../lib/api";
import { Player } from "../../../../types";

export default function EditPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const playerId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const [player, setPlayer] = useState<Player | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;
    let active = true;
    (async () => {
      try {
        // Primär: Detail-Endpoint, Fallback: Liste filtern (falls Backend GET /players/{id} nicht unterstützt).
        const res = await fetch(`${API_BASE}/players/${playerId}`);
        let data: Player | null = null;
        if (res.ok) {
          data = await res.json();
        } else {
          const list = await fetch(`${API_BASE}/players`).then((r) => r.json());
          data = Array.isArray(list) ? list.find((p: Player) => p.id === playerId) : null;
        }
        if (data && active) {
          setPlayer(data);
          setPhotoData(data.photoData || null);
        } else {
          throw new Error("not found");
        }
      } catch (err) {
        if (active) setFeedback("Spieler nicht gefunden.");
      }
    })();
    return () => {
      active = false;
    };
  }, [playerId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!player) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      firstName: (data.get("firstName") as string).trim(),
      lastName: (data.get("lastName") as string).trim(),
      birthdate: (data.get("birthdate") as string).trim(),
      nation: (data.get("nation") as string).trim(),
      playsIn: (data.get("playsIn") as string).trim(),
      club: (data.get("club") as string).trim(),
      level: (data.get("level") as string).trim(),
      height: (data.get("height") as string).trim(),
      foot: (data.get("foot") as string).trim(),
      note: (data.get("note") as string).trim(),
      photoData,
    };
    try {
      const res = await fetch(`${API_BASE}/players/${player.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push(`/players/${player.id}`);
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
          <h1 className="text-2xl font-bold text-white">Spieler bearbeiten</h1>
          <p className="text-sm text-slate-300">Daten anpassen und speichern.</p>
        </div>
        <button onClick={() => router.back()} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:border-[#e10600]/60">
          Zurück
        </button>
      </div>

      <section className="cardish p-5 sm:p-6">
        {feedback && <div className="mb-3 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-100">{feedback}</div>}
        {!player && !feedback && <div className="text-sm text-slate-300">Lädt...</div>}
        {player && (
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Vorname *
              <input
                name="firstName"
                defaultValue={player.firstName}
                required
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Nachname *
              <input
                name="lastName"
                defaultValue={player.lastName}
                required
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Geburtstag *
              <input
                name="birthdate"
                defaultValue={player.birthdate}
                placeholder="dd.mm.yyyy"
                required
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Nationalität *
              <input
                name="nation"
                defaultValue={player.nation}
                required
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Verein
              <input name="club" defaultValue={player.club || ""} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Ligahöhe
              <input
                name="level"
                type="number"
                min="1"
                max="6"
                defaultValue={player.level || ""}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Einsatzland
              <input name="playsIn" defaultValue={player.playsIn || ""} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Größe
              <input name="height" defaultValue={player.height || ""} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Starker Fuß
              <select name="foot" defaultValue={player.foot || ""} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60">
                <option value="">—</option>
                <option value="links">Links</option>
                <option value="rechts">Rechts</option>
                <option value="beidfüßig">Beidfüßig</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300 md:col-span-2">
              Notizen
              <textarea name="note" defaultValue={player.note || ""} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Foto hochladen
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setPhotoData(reader.result?.toString() || null);
                  reader.readAsDataURL(file);
                }}
                className="text-xs text-white"
              />
              {photoData && <img src={photoData} alt="Preview" className="mt-2 h-20 w-20 rounded-lg border border-white/10 object-cover" />}
            </label>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => router.back()} className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:border-[#e10600]/60">
                Abbrechen
              </button>
              <button type="submit" className="rounded-lg bg-gradient-to-r from-[#e10600] to-[#b00012] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(225,6,0,0.35)]">
                Speichern
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
