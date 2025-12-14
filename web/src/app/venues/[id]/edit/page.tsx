/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE } from "../../../../lib/api";
import { Venue } from "../../../../types";

export default function EditVenuePage() {
  const router = useRouter();
  const params = useParams();
  const venueId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id[0] : "";
  const [venue, setVenue] = useState<Venue | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!venueId) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/venues/${venueId}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: Venue = await res.json();
        if (active) {
          setVenue(data);
          setPhotoData(data.photoData || null);
        }
      } catch (err) {
        if (active) setFeedback("Ort nicht gefunden.");
      }
    })();
    return () => {
      active = false;
    };
  }, [venueId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!venue) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: (data.get("name") as string).trim(),
      address: (data.get("address") as string).trim(),
      homeClub: (data.get("homeClub") as string).trim(),
      contact: (data.get("contact") as string).trim(),
      price: (data.get("price") as string).trim(),
      note: (data.get("note") as string).trim(),
      photoData,
    };
    try {
      const res = await fetch(`${API_BASE}/venues/${venue.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push(`/venues/${venue.id}`);
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
          <h1 className="text-2xl font-bold text-white">Austragungsort bearbeiten</h1>
          <p className="text-sm text-slate-300">Stammdaten aktualisieren.</p>
        </div>
        <button onClick={() => router.back()} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:border-[#e10600]/60">
          Zurück
        </button>
      </div>

      <section className="cardish p-5 sm:p-6">
        {feedback && <div className="mb-3 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-100">{feedback}</div>}
        {!venue && !feedback && <div className="text-sm text-slate-300">Lädt...</div>}
        {venue && (
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Name *
              <input name="name" defaultValue={venue.name} required className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Heimatverein
              <input name="homeClub" defaultValue={venue.homeClub || ""} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Anschrift
              <input name="address" defaultValue={venue.address || ""} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Kontakt
              <input name="contact" defaultValue={venue.contact || ""} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Mietpreise
              <input name="price" defaultValue={venue.price || ""} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300 md:col-span-2">
              Notizen
              <textarea name="note" defaultValue={venue.note || ""} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#e10600]/60" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Foto
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
