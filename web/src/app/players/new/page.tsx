/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_BASE } from "../../../lib/api";

export default function NewPlayerPage() {
  const router = useRouter();
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      const res = await fetch(`${API_BASE}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        router.push(`/players/${saved.id}`);
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
          <h1 className="text-2xl font-bold text-white">Spieler anlegen</h1>
          <p className="text-sm text-slate-300">Neue Stammdaten erfassen.</p>
        </div>
        <button onClick={() => router.back()} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:border-[#e10600]/60">
          Zurück
        </button>
      </div>

      <section className="cardish p-5 sm:p-6">
        {feedback && <div className="mb-3 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-100">{feedback}</div>}
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Vorname *
            <input name="firstName" required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Nachname *
            <input name="lastName" required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Geburtstag *
            <input name="birthdate" placeholder="dd.mm.yyyy" required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Nationalität *
            <input name="nation" required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Verein
            <input name="club" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Ligahöhe
            <input name="level" type="number" min="1" max="6" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Einsatzland
            <input name="playsIn" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Größe
            <input name="height" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Starker Fuß
            <select name="foot" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60">
              <option value="">—</option>
              <option value="links">Links</option>
              <option value="rechts">Rechts</option>
              <option value="beidfüßig">Beidfüßig</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300 md:col-span-2">
            Notizen
            <textarea name="note" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
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
              Spieler speichern
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
