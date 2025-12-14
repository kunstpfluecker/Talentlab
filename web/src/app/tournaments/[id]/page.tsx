/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE } from "../../../lib/api";
import { Tournament, Player, Evaluation, Game } from "../../../types";

type TabKey = "overview" | "teams" | "evaluation" | "games";

export function TournamentView({ initialTab = "overview" }: { initialTab?: TabKey }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const tournamentId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation[]>>({});
  const [evalForm, setEvalForm] = useState<{
    playerId: string;
    scoutName: string;
    ratingTechnique: number;
    ratingPhysical: number;
    ratingIntelligence: number;
    ratingMentality: number;
    ratingImpact: number;
    strengths: string;
    weaknesses: string;
    remarks: string;
  }>({
    playerId: "",
    scoutName: "Scout",
    ratingTechnique: 3,
    ratingPhysical: 3,
    ratingIntelligence: 3,
    ratingMentality: 3,
    ratingImpact: 3,
    strengths: "",
    weaknesses: "",
    remarks: "",
  });
  const [teamForm, setTeamForm] = useState<{ name: string; kitColor: string; roster: { playerId: string; number: string }[] }>({
    name: "",
    kitColor: "#e10600",
    roster: [],
  });
  const [gameForm, setGameForm] = useState<{ id?: string | null; teamAId: string; teamBId?: string | null; date: string; time: string; pitchId?: string | null; note: string }>({
    id: null,
    teamAId: "",
    teamBId: "",
    date: "",
    time: "12:00",
    pitchId: "",
    note: "",
  });
  const [showGameForm, setShowGameForm] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [error, setError] = useState<string | null>(null);
  const [rosterSearch, setRosterSearch] = useState<string[]>([]);

  const loadTournament = async () => {
    if (!tournamentId) return;
    const res = await fetch(`${API_BASE}/tournaments/${tournamentId}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data: Tournament = await res.json();
    setTournament(data);
    if (!gameForm.date && data.start) {
      setGameForm((prev) => ({ ...prev, date: data.start?.slice(0, 10) || "" }));
    }
  };

  useEffect(() => {
    if (!tournamentId) return;
    let active = true;
    (async () => {
      try {
        await loadTournament();
      } catch (err) {
        if (active) setError("Turnier nicht gefunden.");
      }
    })();
    return () => {
      active = false;
    };
  }, [tournamentId]);

  useEffect(() => {
    if (!pathname) return;
    const segments = pathname.split("/").filter(Boolean);
    const sub = segments[2]; // tournaments / {id} / sub
    const map: Record<string, TabKey> = { teams: "teams", games: "games", evaluation: "evaluation" };
    setTab(map[sub] || "overview");
  }, [pathname]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/players`);
      const list: Player[] = await res.json();
      setPlayers(list);
    })().catch(() => {});
  }, []);

  const participantPlayers = tournament?.participants ? players.filter((p) => tournament.participants?.includes(p.id)) : [];
  const availablePlayers = participantPlayers;

  const loadEvaluations = async (playerId: string) => {
    const res = await fetch(`${API_BASE}/players/${playerId}/evaluations`);
    if (res.ok) {
      const data: Evaluation[] = await res.json();
      setEvaluations((prev) => ({ ...prev, [playerId]: data }));
    }
  };

  useEffect(() => {
    participantPlayers.forEach((p) => {
      if (!evaluations[p.id]) loadEvaluations(p.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantPlayers.length]);

  const submitEvaluation = async () => {
    if (!evalForm.playerId || !tournamentId) return;
    const payload = {
      eventId: tournamentId,
      playerId: evalForm.playerId,
      scoutName: evalForm.scoutName,
      ratingTechnique: evalForm.ratingTechnique,
      ratingPhysical: evalForm.ratingPhysical,
      ratingIntelligence: evalForm.ratingIntelligence,
      ratingMentality: evalForm.ratingMentality,
      ratingImpact: evalForm.ratingImpact,
      strengths: evalForm.strengths || null,
      weaknesses: evalForm.weaknesses || null,
      remarks: evalForm.remarks || null,
    };
    const res = await fetch(`${API_BASE}/evaluations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setEvalForm((prev) => ({ ...prev, strengths: "", weaknesses: "", remarks: "" }));
      await loadEvaluations(evalForm.playerId);
    }
  };

  const nextFreeNumber = () => {
    const used = new Set(teamForm.roster.map((r) => Number(r.number)));
    let n = 2;
    while (used.has(n) && n < 100) n++;
    return String(n);
  };

  const resetGameForm = () => {
    setGameForm({
      id: null,
      teamAId: "",
      teamBId: "",
      date: tournament?.start?.slice(0, 10) || "",
      time: "12:00",
      pitchId: "",
      note: "",
    });
    setGameError(null);
    setShowGameForm(false);
  };

  const submitGame = async () => {
    if (!tournamentId) return;
    setGameError(null);
    if (!gameForm.teamAId) {
      setGameError("Mindestens Team A wählen.");
      return;
    }
    let kickoff: string | null = null;
    if (gameForm.date) {
      const time = gameForm.time || "00:00";
      const dt = new Date(`${gameForm.date}T${time}`);
      if (isNaN(dt.getTime())) {
        setGameError("Ungültiges Datum oder Uhrzeit.");
        return;
      }
      kickoff = dt.toISOString();
      if (tournament?.start && tournament?.end) {
        const d = new Date(gameForm.date);
        const start = new Date(tournament.start);
        const end = new Date(tournament.end);
        if (d < start || d > end) {
          setGameError("Termin liegt außerhalb des Turnierzeitraums.");
          return;
        }
      }
    }
    const payload = {
      teamAId: gameForm.teamAId,
      teamBId: gameForm.teamBId || null,
      kickoff,
      kitA: null,
      kitB: null,
      note: gameForm.note || null,
      pitchId: gameForm.pitchId || null,
    };
    const method = gameForm.id ? "PUT" : "POST";
    const url = gameForm.id
      ? `${API_BASE}/tournaments/${tournamentId}/games/${gameForm.id}`
      : `${API_BASE}/tournaments/${tournamentId}/games`;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await loadTournament();
        resetGameForm();
        setShowGameForm(false);
      } else {
        setGameError(`Speichern fehlgeschlagen (Status ${res.status}).`);
      }
    } catch (err: any) {
      setGameError("Speichern fehlgeschlagen (Netzwerkfehler). Bitte Backend prüfen.");
    }
  };

  const handleEditGame = (g: Game) => {
    const dt = g.kickoff ? new Date(g.kickoff) : null;
    setGameForm({
      id: g.id,
      teamAId: g.teamAId,
      teamBId: g.teamBId || "",
      date: dt ? dt.toISOString().slice(0, 10) : tournament?.start?.slice(0, 10) || "",
      time: dt ? dt.toISOString().slice(11, 16) : "12:00",
      pitchId: g.pitchId || "",
      note: g.note || "",
    });
    setTab("games");
    setShowGameForm(true);
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!tournamentId) return;
    const ok = window.confirm("Spiel löschen?");
    if (!ok) return;
    const res = await fetch(`${API_BASE}/tournaments/${tournamentId}/games/${gameId}`, { method: "DELETE" });
    if (res.ok) {
      await loadTournament();
      if (gameForm.id === gameId) resetGameForm();
    } else {
      setGameError(`Löschen fehlgeschlagen (Status ${res.status}).`);
    }
  };

  const submitTeam = async () => {
    if (!teamForm.name || !tournamentId) return;
    const payload = {
      name: teamForm.name,
      kitColor: teamForm.kitColor,
      roster: teamForm.roster.filter((r) => r.playerId),
    };
    const res = await fetch(`${API_BASE}/tournaments/${tournamentId}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await loadTournament();
      setTeamForm({ name: "", kitColor: "#e10600", roster: [] });
      setRosterSearch([]);
    }
  };

  const deleteTeam = async (teamId: string, name: string) => {
    if (!tournamentId) return;
    const ok = window.confirm(`Team "${name}" löschen?`);
    if (!ok) return;
    const res = await fetch(`${API_BASE}/tournaments/${tournamentId}/teams/${teamId}`, { method: "DELETE" });
    if (res.ok) await loadTournament();
  };

  const handleDelete = async () => {
    if (!tournament) return;
    const confirmed = window.confirm(`Soll das Turnier "${tournament.name}" wirklich gelöscht werden?`);
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE}/tournaments/${tournament.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/tournaments");
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
          <h1 className="text-2xl font-bold text-white">Turnier-Detail</h1>
          <p className="text-sm text-slate-300">Stammdaten und Aktionen.</p>
        </div>
        <Link href="/tournaments" className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:border-[#e10600]/60">
          Zurück zur Übersicht
        </Link>
      </div>

      <section className="cardish p-5 sm:p-6">
        {error && <div className="mb-3 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}
        {!error && !tournament && <div className="text-sm text-slate-300">Lädt...</div>}
        {tournament && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">{tournament.name}</h2>
                <div className="text-sm text-slate-300">
                  {tournament.venue?.name ? `Austragungsort: ${tournament.venue.name}` : "Kein Austragungsort"}
                  {tournament.start ? ` • ${tournament.start}` : ""} {tournament.end ? `– ${tournament.end}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => router.push(`/tournaments/${tournament.id}/edit`)} className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:border-[#e10600]/60">
                  Bearbeiten
                </button>
                <button onClick={handleDelete} className="rounded-lg border border-red-500/50 px-3 py-2 text-sm font-semibold text-red-100 hover:border-red-400 hover:bg-red-500/10">
                  Löschen
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "overview", label: "Übersicht", href: `/tournaments/${tournament.id}` },
                { key: "teams", label: "Teams anlegen", href: `/tournaments/${tournament.id}/teams` },
                { key: "games", label: "Spiele", href: `/tournaments/${tournament.id}/games` },
                { key: "evaluation", label: "Evaluation erfassen", href: `/tournaments/${tournament.id}/evaluation` },
              ].map((t) => (
                <Link
                  key={t.key}
                  href={t.href}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    tab === t.key ? "bg-white/10 text-white border border-white/20" : "text-slate-200 border border-white/10 hover:border-[#e10600]/60"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </div>

            {tab === "overview" && (
              <div className="space-y-4">
                {tournament.note && <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-3 text-sm text-slate-100">{tournament.note}</div>}

                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-1">Teams</div>
                  {tournament.teams?.length ? (
                    <div className="space-y-2">
                      {tournament.teams.map((team) => (
                        <div key={team.id} className="rounded-lg border border-white/15 bg-white/5 p-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-white font-semibold">
                              {team.name} <span className="text-xs text-slate-300">{team.kitColor}</span>
                            </div>
                            <button
                              onClick={() => deleteTeam(team.id, team.name)}
                              className="rounded-lg border border-red-500/40 px-2 py-1 text-[11px] text-red-100 hover:border-red-400 hover:bg-red-500/10"
                            >
                              Team löschen
                            </button>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-white">
                            {team.roster?.length ? (
                              team.roster.map((r) => {
                                const pl = players.find((p) => p.id === r.playerId);
                                return (
                                  <Link
                                    key={`${team.id}-${r.playerId}`}
                                    href={pl ? `/players/${pl.id}` : "#"}
                                    className="rounded-full border border-white/10 bg-white/10 px-2 py-1 hover:border-[#e10600]/60 hover:underline"
                                  >
                                    #{r.number} • {pl ? `${pl.firstName} ${pl.lastName}` : r.playerId}
                                  </Link>
                                );
                              })
                            ) : (
                              <span className="text-slate-300">Kein Kader hinterlegt.</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-300">Keine Teams hinterlegt.</div>
                  )}
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Teilnehmende Spieler</div>
                    <Link href="/players" className="text-[11px] text-white underline-offset-4 hover:underline">
                      Gesamtliste öffnen
                    </Link>
                  </div>
                  {participantPlayers.length ? (
                    <div className="space-y-2">
                      {participantPlayers.map((p) => (
                        <div key={p.id} className="rounded-lg border border-white/10 bg-white/5 p-2">
                          <div className="flex items-center justify-between">
                            <Link href={`/players/${p.id}`} className="text-white font-semibold hover:underline">
                              {p.firstName} {p.lastName}
                            </Link>
                            {(() => {
                              const isActive = evalForm.playerId === p.id && (tab as TabKey) === "evaluation";
                              return (
                            <button
                              onClick={() => {
                                setEvalForm((prev) => ({ ...prev, playerId: p.id }));
                                setTab("evaluation");
                              }}
                              className={`rounded-full px-3 py-1 text-xs ${isActive ? "bg-[#e10600]" : "border border-white/20"} text-white`}
                            >
                              Bewerten
                            </button>
                              );
                            })()}
                          </div>
                          <div className="text-xs text-slate-300">{p.position || "Position n/a"} • {p.club || "—"}</div>
                          <div className="mt-1 text-xs text-slate-400">Bewertungen: {evaluations[p.id]?.length || 0}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-300">Keine Spieler verknüpft. Bitte im Turnier bearbeiten hinzufügen.</div>
                  )}
                </div>
              </div>
            )}

            {tab === "teams" && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Team anlegen</div>
                  {!availablePlayers.length && <div className="text-[11px] text-red-200">Keine teilnehmenden Spieler vorhanden.</div>}
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="flex flex-col gap-1 text-xs text-slate-300">
                    Teamname
                    <input
                      value={teamForm.name}
                      onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-slate-300">
                    Trikotfarbe
                    <input
                      type="color"
                      value={teamForm.kitColor}
                      onChange={(e) => setTeamForm((prev) => ({ ...prev, kitColor: e.target.value }))}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none"
                    />
                  </label>
                  <div className="flex items-end">
                    <button
                      onClick={() =>
                        setTeamForm((prev) => {
                          setRosterSearch((rs) => [...rs, ""]);
                          return {
                            ...prev,
                            roster: [...prev.roster, { playerId: "", number: nextFreeNumber() }],
                          };
                        })
                      }
                      className="w-full rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:border-[#e10600]/60"
                      disabled={!availablePlayers.length}
                    >
                      Spieler hinzufügen
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {teamForm.roster.map((r, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="flex-1 min-w-[220px]">
                        <label className="flex flex-col gap-1 text-xs text-slate-300">
                          Spieler (Freitext mit Vorschlägen)
                          <input
                            list={`player-suggest-${idx}`}
                            value={rosterSearch[idx] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRosterSearch((prev) => {
                                const next = [...prev];
                                next[idx] = val;
                                return next;
                              });
                              const exact = availablePlayers.find(
                                (p) => `${p.firstName} ${p.lastName}`.toLowerCase() === val.trim().toLowerCase()
                              );
                              setTeamForm((prev) => {
                                const roster = [...prev.roster];
                                roster[idx] = { ...roster[idx], playerId: exact ? exact.id : "" };
                                return { ...prev, roster };
                              });
                            }}
                            placeholder="Spieler wählen oder tippen..."
                            className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white outline-none"
                          />
                          <datalist id={`player-suggest-${idx}`}>
                            {availablePlayers.map((p) => (
                              <option key={p.id} value={`${p.firstName} ${p.lastName}`} />
                            ))}
                          </datalist>
                        </label>
                      </div>
                      <label className="flex flex-col gap-1 text-xs text-slate-300">
                        Rückennummer
                        <input
                          value={r.number}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTeamForm((prev) => {
                              const roster = [...prev.roster];
                              roster[idx] = { ...roster[idx], number: val };
                              return { ...prev, roster };
                            });
                          }}
                          className="w-28 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white outline-none"
                          placeholder="Rückennummer"
                        />
                      </label>
                      <button
                        onClick={() =>
                          setTeamForm((prev) => {
                            setRosterSearch((rs) => rs.filter((_, i) => i !== idx));
                            return {
                              ...prev,
                              roster: prev.roster.filter((_, i) => i !== idx),
                            };
                          })
                        }
                        className="rounded-lg border border-red-500/50 px-3 py-1 text-xs font-semibold text-red-100 hover:border-red-400 hover:bg-red-500/10"
                      >
                        Entfernen
                      </button>
                    </div>
                  ))}
                  {!teamForm.roster.length && <div className="text-xs text-slate-300">Keine Spieler ausgewählt.</div>}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={submitTeam}
                    disabled={!teamForm.name || !availablePlayers.length}
                    className="rounded-lg bg-gradient-to-r from-[#e10600] to-[#b00012] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(225,6,0,0.35)] disabled:opacity-50"
                  >
                    Team speichern
                  </button>
                </div>
              </div>
            )}

            {tab === "games" && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Spiele</div>
                  <div className="flex gap-2">
                    {showGameForm && gameForm.id && (
                      <button
                        onClick={resetGameForm}
                        className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-white hover:border-[#e10600]/60"
                      >
                        Abbrechen
                      </button>
                    )}
                    <button
                      onClick={() => {
                        resetGameForm();
                        setShowGameForm(true);
                      }}
                      className="rounded-lg bg-gradient-to-r from-[#e10600] to-[#b00012] px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(225,6,0,0.35)]"
                    >
                      Spiel anlegen
                    </button>
                  </div>
                </div>
                {gameError && <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-2 text-xs text-red-100">{gameError}</div>}

                <div className="space-y-2">
                  {(tournament.games || []).length ? (
                    (tournament.games || [])
                      .slice()
                      .sort((a, b) => (a.kickoff || "").localeCompare(b.kickoff || ""))
                      .map((g) => {
                        const teamA = tournament.teams.find((tm) => tm.id === g.teamAId);
                        const teamB = tournament.teams.find((tm) => tm.id === g.teamBId);
                        return (
                          <div key={g.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <div className="text-sm text-white">
                              <div className="font-semibold">
                                {teamA?.name || "Team A"} {teamB ? `vs. ${teamB.name}` : "(Training)"}
                              </div>
                              <div className="text-xs text-slate-300">
                                {g.kickoff ? new Date(g.kickoff).toLocaleString("de-DE") : "Kein Termin"}{" "}
                                {g.pitchId ? `• Platz: ${(tournament.venue?.pitches || []).find((p) => p.id === g.pitchId)?.label || g.pitchId}` : ""}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditGame(g)}
                                className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-white hover:border-[#e10600]/60"
                              >
                                Bearbeiten
                              </button>
                              <Link
                                href={`/tournaments/${tournament.id}/games/${g.id}`}
                                className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-white hover:border-[#e10600]/60"
                              >
                                Details
                              </Link>
                              <button
                                onClick={() => handleDeleteGame(g.id)}
                                className="rounded-lg border border-red-500/50 px-3 py-1 text-xs font-semibold text-red-100 hover:border-red-400 hover:bg-red-500/10"
                              >
                                Löschen
                              </button>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-xs text-slate-300">Keine Spiele angelegt.</div>
                  )}
                </div>

                {showGameForm && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-400">{gameForm.id ? "Spiel bearbeiten" : "Spiel anlegen"}</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs text-slate-300">
                      Team A *
                      <select
                        value={gameForm.teamAId}
                        onChange={(e) => setGameForm((prev) => ({ ...prev, teamAId: e.target.value }))}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                      >
                        <option value="">Team wählen</option>
                        {tournament.teams.map((tm) => (
                          <option key={tm.id} value={tm.id}>{tm.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-slate-300">
                      Team B (optional)
                      <select
                        value={gameForm.teamBId || ""}
                        onChange={(e) => setGameForm((prev) => ({ ...prev, teamBId: e.target.value }))}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                      >
                        <option value="">Kein Gegner / Training</option>
                        {tournament.teams.map((tm) => (
                          <option key={tm.id} value={tm.id}>{tm.name}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="flex flex-col gap-1 text-xs text-slate-300">
                      Tag
                      <input
                        type="date"
                        value={gameForm.date}
                        onChange={(e) => setGameForm((prev) => ({ ...prev, date: e.target.value }))}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-slate-300">
                      Uhrzeit
                      <input
                        type="time"
                        value={gameForm.time}
                        onChange={(e) => setGameForm((prev) => ({ ...prev, time: e.target.value }))}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-slate-300">
                      Platz
                      <select
                        value={gameForm.pitchId || ""}
                        onChange={(e) => setGameForm((prev) => ({ ...prev, pitchId: e.target.value }))}
                        disabled={!tournament.venue?.pitches?.length}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none disabled:opacity-50"
                      >
                        <option value="">Kein Platz gewählt</option>
                        {tournament.venue?.pitches?.map((p) => (
                          <option key={p.id || p.label} value={p.id || ""}>{p.label}</option>
                        ))}
                      </select>
                      {!tournament.venue?.pitches?.length && (
                        <span className="text-[11px] text-slate-400">Kein Austragungsort/Platz hinterlegt.</span>
                      )}
                    </label>
                  </div>
                  <label className="flex flex-col gap-1 text-xs text-slate-300">
                    Notizen
                    <textarea
                      value={gameForm.note}
                      onChange={(e) => setGameForm((prev) => ({ ...prev, note: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                    />
                  </label>
                    <div className="flex justify-end gap-2">
                      {gameForm.id && (
                        <button
                          type="button"
                          onClick={resetGameForm}
                          className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:border-[#e10600]/60"
                        >
                          Abbrechen
                        </button>
                      )}
                      <button
                        onClick={submitGame}
                        className="rounded-lg bg-gradient-to-r from-[#e10600] to-[#b00012] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(225,6,0,0.35)] disabled:opacity-50"
                      >
                        {gameForm.id ? "Spiel speichern" : "Spiel anlegen"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "evaluation" && participantPlayers.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200 space-y-3">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Evaluation erfassen</div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="flex flex-col gap-1 text-xs text-slate-300">
                    Spieler
                    <select
                      value={evalForm.playerId}
                      onChange={(e) => setEvalForm((prev) => ({ ...prev, playerId: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white outline-none"
                    >
                      <option value="">Spieler wählen</option>
                      {participantPlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-slate-300">
                    Scout
                    <input
                      value={evalForm.scoutName}
                      onChange={(e) => setEvalForm((prev) => ({ ...prev, scoutName: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white outline-none"
                    />
                  </label>
                  <div className="flex items-end">
                    <button
                      onClick={submitEvaluation}
                      disabled={!evalForm.playerId}
                      className="w-full rounded-lg bg-gradient-to-r from-[#e10600] to-[#b00012] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(225,6,0,0.35)] disabled:opacity-50"
                    >
                      Speichern
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-5">
                  {[
                    ["ratingTechnique", "Technik"],
                    ["ratingPhysical", "Physis"],
                    ["ratingIntelligence", "Spielintelligenz"],
                    ["ratingMentality", "Mentalität"],
                    ["ratingImpact", "Impact"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex flex-col gap-1 text-xs text-slate-300">
                      {label}
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={(evalForm as any)[key]}
                        onChange={(e) => setEvalForm((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white outline-none"
                      />
                    </label>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <textarea
                    placeholder="Stärken"
                    value={evalForm.strengths}
                    onChange={(e) => setEvalForm((prev) => ({ ...prev, strengths: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  />
                  <textarea
                    placeholder="Schwächen"
                    value={evalForm.weaknesses}
                    onChange={(e) => setEvalForm((prev) => ({ ...prev, weaknesses: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  />
                  <textarea
                    placeholder="Bemerkungen"
                    value={evalForm.remarks}
                    onChange={(e) => setEvalForm((prev) => ({ ...prev, remarks: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
              </div>
            )}

            {tab === "evaluation" && participantPlayers.length === 0 && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                Keine teilnehmenden Spieler hinterlegt. Bitte im Turnier editieren hinzufügen.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default function TournamentDetailPage() {
  return <TournamentView initialTab="overview" />;
}
