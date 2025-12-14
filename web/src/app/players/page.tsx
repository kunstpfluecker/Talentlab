/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Player } from "../../types";
import { computeAge } from "../../lib/utils";
import { usePlayers } from "../../hooks/usePlayers";
import { API_BASE } from "../../lib/api";

export default function PlayersListPage() {
  const { data: players, loading, error, refresh } = usePlayers();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"name" | "nation" | "age" | "club" | "level">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    const filteredPlayers = players.filter((p) =>
      `${p.firstName} ${p.lastName} ${p.nation || ""} ${p.club || ""} ${p.level || ""} ${p.playsIn || ""} ${p.foot || ""}`
        .toLowerCase()
        .includes(s),
    );
    const factor = sortDir === "asc" ? 1 : -1;
    const val = (p: Player) => {
      if (sortField === "name") return `${p.firstName} ${p.lastName}`.toLowerCase();
      if (sortField === "nation") return (p.nation || "").toLowerCase();
      if (sortField === "club") return (p.club || "").toLowerCase();
      if (sortField === "level") return p.level ? Number(p.level) : 0;
      if (sortField === "age") return computeAge(p.birthdate) || 0;
      return "";
    };
    return filteredPlayers.sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      if (va < vb) return -1 * factor;
      if (va > vb) return 1 * factor;
      return 0;
    });
  }, [players, search, sortDir, sortField]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">Laden fehlgeschlagen: {error}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Spieler</h1>
          <p className="text-sm text-slate-300">Übersicht, Filter, Pagination und Sortierung.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/players/new"
            className="rounded-lg bg-gradient-to-r from-[#e10600] to-[#b00012] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(225,6,0,0.35)]"
          >
            Spieler anlegen
          </Link>
        </div>
      </div>

      <div className="cardish p-4 sm:p-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-1/2">
            <input
              placeholder="Suche in allen Feldern..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-[#e10600]/60"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
            <label className="flex items-center gap-2">
              Pro Seite:
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <span className="pill">{filtered.length} Spieler</span>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-200 shadow-lg">Lädt Spieler...</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-slate-200">
                <thead className="bg-white/10 text-xs uppercase tracking-[0.1em] text-slate-300">
                  <tr>
                    {([
                      { key: "name", label: "Name" },
                      { key: "club", label: "Verein" },
                      { key: "level", label: "Liga" },
                      { key: "nation", label: "Nation" },
                      { key: "age", label: "Alter" },
                    ] as const).map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => {
                          const same = sortField === key;
                          setSortField(key);
                          setSortDir(same ? (sortDir === "asc" ? "desc" : "asc") : "asc");
                        }}
                        className="px-3 py-2 text-left text-white hover:cursor-pointer"
                      >
                        {label} {sortField === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-right text-white">Aktion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {pageItems.map((p) => {
                    const age = computeAge(p.birthdate);
                    return (
                      <tr key={p.id} className="hover:bg-white/5">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {p.photoData ? (
                              <img src={p.photoData} alt={`${p.firstName} ${p.lastName}`} className="h-8 w-8 rounded-full object-cover border border-white/15" />
                            ) : (
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                                {`${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`.trim().toUpperCase() || "?"}
                              </span>
                            )}
                            <div>
                              <Link href={`/players/${p.id}`} className="font-semibold text-white hover:underline">
                                {p.firstName} {p.lastName}
                              </Link>
                              <div className="text-[11px] uppercase tracking-[0.12em] text-[#ffb3b8]">{p.birthdate || "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-200">{p.club || "—"}</td>
                        <td className="px-3 py-2 text-slate-200">{p.level ? `Liga ${p.level}` : "—"}</td>
                        <td className="px-3 py-2 text-slate-200">{p.nation || "—"}</td>
                        <td className="px-3 py-2 text-slate-200">{age ?? "—"}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/players/${p.id}/edit`}
                              className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-white hover:border-[#e10600]/60"
                            >
                              Bearbeiten
                            </Link>
                            <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const ok = window.confirm(`Spieler "${p.firstName} ${p.lastName}" löschen?`);
                              if (!ok) return;
                              const res = await fetch(`${API_BASE}/players/${p.id}`, { method: "DELETE" });
                              if (res.ok) {
                                  await refresh();
                              }
                            }}
                            className="rounded-lg border border-red-500/50 px-3 py-1 text-xs font-semibold text-red-100 hover:border-red-400 hover:bg-red-500/10"
                          >
                            Löschen
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!pageItems.length && (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-slate-300">
                        Keine Spieler gefunden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
              <div>
                Seite {page} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-white/20 px-2 py-1 disabled:opacity-50 hover:border-[#e10600]/60"
                >
                  Zurück
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-white/20 px-2 py-1 disabled:opacity-50 hover:border-[#e10600]/60"
                >
                  Weiter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
