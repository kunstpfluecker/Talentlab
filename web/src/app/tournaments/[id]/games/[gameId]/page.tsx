"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE } from "../../../../../lib/api";
import { Game, Tournament } from "../../../../../types";

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const gameId = Array.isArray(params?.gameId) ? params?.gameId[0] : (params?.gameId as string);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [videoMessage, setVideoMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    if (!tournamentId || !gameId) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/tournaments/${tournamentId}`);
        if (!res.ok) throw new Error();
        const data: Tournament = await res.json();
        setTournament(data);
        const found = (data.games || []).find((g) => g.id === gameId) || null;
        setGame(found || null);
      } catch (err) {
        setVideoMessage("Spiel nicht gefunden.");
      }
    })();
  }, [tournamentId, gameId]);

  const handleUpload = async () => {
    if (!tournamentId || !gameId || !fileName) {
      setVideoMessage("Bitte erst eine Datei auswählen.");
      return;
    }
    setUploading(true);
    setVideoMessage(null);
    try {
      const res = await fetch(`${API_BASE}/tournaments/${tournamentId}/games/${gameId}/video`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fileName, status: "uploaded" }),
      });
      if (res.ok) {
        setVideoMessage("Video-Upload gemeldet (Status: uploaded).");
      } else {
        setVideoMessage(`Upload fehlgeschlagen (Status ${res.status}).`);
      }
    } catch (err) {
      setVideoMessage("Upload fehlgeschlagen (Netzwerkfehler).");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Spiel-Detail</h1>
          <p className="text-sm text-slate-300">Daten & Video-Upload.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.back()} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:border-[#e10600]/60">
            Zurück
          </button>
          <Link href={`/tournaments/${tournamentId}`} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:border-[#e10600]/60">
            Turnier
          </Link>
        </div>
      </div>

      {!game && <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-200">Lädt Spiel...</div>}
      {game && tournament && (
        <div className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">
                  {(tournament.teams.find((t) => t.id === game.teamAId)?.name || "Team A")}{" "}
                  {game.teamBId ? `vs. ${tournament.teams.find((t) => t.id === game.teamBId)?.name || "Team B"}` : "(Training)"}
                </div>
                <div className="text-xs text-slate-300">
                  {game.kickoff ? new Date(game.kickoff).toLocaleString("de-DE") : "Kein Termin"}
                  {game.pitchId ? ` • Platz: ${(tournament.venue?.pitches || []).find((p) => p.id === game.pitchId)?.label || game.pitchId}` : ""}
                </div>
              </div>
              <div className="flex gap-2 text-xs text-slate-300">
                {game.note && <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1">Notiz: {game.note}</span>}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white space-y-3">
            <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Video hochladen</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                className="text-xs text-white"
              />
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="rounded-lg bg-gradient-to-r from-[#e10600] to-[#b00012] px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(225,6,0,0.35)] disabled:opacity-50"
              >
                {uploading ? "Lädt..." : "Upload melden"}
              </button>
            </div>
            {videoMessage && <div className="text-xs text-slate-200">{videoMessage}</div>}
            <div>
              <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-1">Videos</div>
              {game.videos?.length ? (
                <ul className="space-y-1 text-sm text-slate-200">
                  {game.videos.map((v) => (
                    <li key={v.id || v.name} className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-2 py-1">
                      <span>{v.name}</span>
                      <span className="text-[11px] text-slate-400">{v.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-slate-300">Noch keine Videos.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
