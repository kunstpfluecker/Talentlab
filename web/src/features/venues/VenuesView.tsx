/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Venue } from "../../types";
import { API_BASE } from "../../lib/api";

type Props = {
  venues: Venue[];
  setVenues: (v: Venue[]) => void;
  venueForm: Venue;
  setVenueForm: (v: Venue) => void;
  venueTab: "list" | "form" | "detail";
  setVenueTab: (t: "list" | "form" | "detail") => void;
  selectedVenueId: string;
  setSelectedVenueId: (id: string) => void;
};

export function VenuesView({
  venues,
  setVenues,
  venueForm,
  setVenueForm,
  venueTab,
  setVenueTab,
  selectedVenueId,
  setSelectedVenueId,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 text-sm font-semibold text-slate-200">
        <button
          onClick={() => {
            setVenueTab("list");
            setSelectedVenueId("");
          }}
          className={`rounded-full px-4 py-2 transition ${
            venueTab === "list" ? "bg-[#e10600] text-white shadow-[0_8px_24px_rgba(225,6,0,0.35)]" : "hover:text-white"
          }`}
        >
          Übersicht
        </button>
        <button
          onClick={() => {
            setVenueTab("form");
            setVenueForm({ id: "", name: "", address: "", homeClub: "", contact: "", price: "", note: "", photoData: "", pitches: [] });
            setSelectedVenueId("");
          }}
          className={`rounded-full px-4 py-2 transition ${
            venueTab === "form" ? "bg-[#e10600] text-white shadow-[0_8px_24px_rgba(225,6,0,0.35)]" : "hover:text-white"
          }`}
        >
          Ort anlegen
        </button>
      </div>
      {venueTab === "list" && (
        <section className="cardish p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white">Austragungsorte</h2>
              <p className="text-sm text-slate-300">Tabellarische Übersicht aller Sportanlagen.</p>
            </div>
            <span className="pill">{venues.length} Orte</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-slate-200">
                <thead className="bg-white/10 text-xs uppercase tracking-[0.1em] text-slate-300">
                  <tr>
                    <th className="px-3 py-2 text-left text-white">Name</th>
                    <th className="px-3 py-2 text-left text-white">Adresse</th>
                    <th className="px-3 py-2 text-left text-white">Heimatverein</th>
                    <th className="px-3 py-2 text-left text-white">Plätze</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {venues.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-white/5 cursor-pointer"
                      onClick={() => {
                        setSelectedVenueId(v.id);
                        setVenueTab("detail");
                      }}
                    >
                      <td className="px-3 py-2 text-white">
                        <Link href={`/venues/${v.id}`} prefetch={false} className="hover:underline">
                          {v.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-slate-200">{v.address || "—"}</td>
                      <td className="px-3 py-2 text-slate-200">{v.homeClub || "—"}</td>
                      <td className="px-3 py-2 text-slate-200">{v.pitches?.length || 0}</td>
                    </tr>
                  ))}
                  {!venues.length && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-slate-300">Keine Orte hinterlegt.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
      {venueTab === "detail" && selectedVenueId && (
        <section className="cardish p-5 sm:p-6">
          {(() => {
            const v = venues.find((vv) => vv.id === selectedVenueId);
            if (!v) return <div className="text-slate-200">Ort nicht gefunden.</div>;
            return (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">{v.name}</h2>
                    <p className="text-sm text-slate-300">{v.address || v.homeClub || "—"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setVenueTab("list");
                        setSelectedVenueId("");
                      }}
                      className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:border-[#e10600]/60"
                    >
                      Zurück
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVenueForm({
                          id: v.id,
                          name: v.name,
                          address: v.address || "",
                          homeClub: v.homeClub || "",
                          contact: v.contact || "",
                          price: v.price || "",
                          note: v.note || "",
                          photoData: v.photoData || "",
                          pitches: v.pitches || [],
                        });
                        setVenueTab("form");
                      }}
                      className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:border-[#e10600]/60"
                    >
                      Bearbeiten
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 text-sm text-slate-200">
                  <div><span className="text-slate-400">Heimatverein:</span> {v.homeClub || "—"}</div>
                  <div><span className="text-slate-400">Kontakt:</span> {v.contact || "—"}</div>
                  <div><span className="text-slate-400">Mietpreis:</span> {v.price || "—"}</div>
                  {v.note && <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-3 text-sm text-slate-100">{v.note}</div>}
                  {v.photoData && <img src={v.photoData} alt={v.name} className="h-32 w-32 rounded-lg object-cover border border-white/10" />}
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="mb-2 text-xs uppercase tracking-[0.12em] text-slate-300">Plätze</p>
                    {v.pitches?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {v.pitches.map((p) => (
                          <span key={p.id || p.label} className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs text-white">
                            {p.label} • {p.surface || "?"}{p.lights ? " • Flutlicht" : ""}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-300">Keine Plätze.</div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
            </section>
          )}
          {venueTab === "form" && (
            <section className="cardish p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{venueForm.id ? "Ort bearbeiten" : "Ort anlegen"}</h2>
                  <p className="text-sm text-slate-300">Mit Plätzen, Kontakt und Foto.</p>
                </div>
                <span className="pill">{venueForm.pitches?.length || 0} Plätze</span>
              </div>
          <div className="grid gap-2 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Name *
              <input
                value={venueForm.name}
                onChange={(e) => setVenueForm((prev) => ({ ...prev, name: e.target.value }))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-[#e10600]/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Heimatverein
              <input
                value={venueForm.homeClub || ""}
                onChange={(e) => setVenueForm((prev) => ({ ...prev, homeClub: e.target.value }))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-[#e10600]/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Anschrift
              <input
                value={venueForm.address || ""}
                onChange={(e) => setVenueForm((prev) => ({ ...prev, address: e.target.value }))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-[#e10600]/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Kontakt
              <input
                value={venueForm.contact || ""}
                onChange={(e) => setVenueForm((prev) => ({ ...prev, contact: e.target.value }))}
                placeholder="Tel/Email"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-[#e10600]/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Mietpreise
              <input
                value={venueForm.price || ""}
                onChange={(e) => setVenueForm((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="z.B. 250€ / Tag"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-[#e10600]/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Notizen
              <input
                value={venueForm.note || ""}
                onChange={(e) => setVenueForm((prev) => ({ ...prev, note: e.target.value }))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-[#e10600]/60"
              />
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
                  reader.onload = () => {
                    const result = reader.result?.toString() || "";
                    setVenueForm((prev) => ({ ...prev, photoData: result }));
                  };
                  reader.readAsDataURL(file);
                }}
                className="text-xs text-white"
              />
              {venueForm.photoData && (
                <img src={venueForm.photoData} alt="Venue" className="mt-2 h-20 w-20 rounded-lg border border-white/10 object-cover" />
              )}
            </label>
          </div>
          <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-2">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-200">
              <span>Plätze</span>
              <button
                type="button"
                onClick={() =>
                  setVenueForm((prev) => ({
                    ...prev,
                    pitches: [...(prev.pitches || []), { label: `Platz ${prev.pitches?.length ? prev.pitches.length + 1 : 1}`, surface: "Rasen", lights: false }],
                  }))
                }
                className="rounded-lg border border-white/20 px-2 py-1 text-[11px] text-white hover:border-[#e10600]/60"
              >
                Platz hinzufügen
              </button>
            </div>
            <div className="space-y-2">
              {(venueForm.pitches || []).map((p, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white">
                  <input
                    value={p.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVenueForm((prev) => {
                        const next = [...(prev.pitches || [])];
                        next[idx] = { ...next[idx], label: val };
                        return { ...prev, pitches: next };
                      });
                    }}
                    className="w-32 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none"
                  />
                  <select
                    value={p.surface || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVenueForm((prev) => {
                        const next = [...(prev.pitches || [])];
                        next[idx] = { ...next[idx], surface: val };
                        return { ...prev, pitches: next };
                      });
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none"
                  >
                    <option value="">Typ</option>
                    <option>Rasen</option>
                    <option>Kunstrasen</option>
                    <option>Hybrid</option>
                    <option>Asche</option>
                    <option>Halle</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={!!p.lights}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setVenueForm((prev) => {
                          const next = [...(prev.pitches || [])];
                          next[idx] = { ...next[idx], lights: val };
                          return { ...prev, pitches: next };
                        });
                      }}
                      className="h-4 w-4 accent-[#e10600]"
                    />
                    Flutlicht
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setVenueForm((prev) => ({ ...prev, pitches: (prev.pitches || []).filter((_, i) => i !== idx) }))
                    }
                    className="rounded-lg border border-red-500/40 px-2 py-1 text-[11px] text-red-100 hover:border-red-400 hover:bg-red-500/10"
                  >
                    Entfernen
                  </button>
                </div>
              ))}
              {!(venueForm.pitches || []).length && <div className="text-xs text-slate-300">Keine Plätze hinterlegt.</div>}
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setVenueTab("list");
                setSelectedVenueId("");
                setVenueForm({ id: "", name: "", address: "", homeClub: "", contact: "", price: "", note: "", photoData: "", pitches: [] });
              }}
              className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:border-[#e10600]/60"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={() => {
                const payload = {
                  name: venueForm.name,
                  address: venueForm.address,
                  homeClub: venueForm.homeClub,
                  contact: venueForm.contact,
                  price: venueForm.price,
                  note: venueForm.note,
                  photoData: venueForm.photoData,
                  pitches: venueForm.pitches || [],
                };
                if (!payload.name) return;
                const isUpdate = !!venueForm.id;
                const url = isUpdate ? `${API_BASE}/venues/${venueForm.id}` : `${API_BASE}/venues`;
                const method = isUpdate ? "PUT" : "POST";
                fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (Array.isArray(data)) {
                      setVenues(data);
                    }
                    setVenueTab("list");
                  });
              }}
              className="rounded-lg bg-gradient-to-r from-[#e10600] to-[#b00012] px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(225,6,0,0.35)]"
            >
              {venueForm.id ? "Ort speichern" : "Ort anlegen"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
