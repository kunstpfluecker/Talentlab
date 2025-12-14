# TalentLab MVP (Local Demo)

## Was wurde gebaut?
- Monolithisches FastAPI + Next.js Setup mit SQLite.
- Domain: Events (Tournaments), Teams, Spieler, Evaluations (1–5 Ratings + Notizen), Action-Stats, einfacher Talent Score (0–100) mit Sub-Indikatoren.
- Seed-Daten: Demo-Event mit 20 Spielern, Teams, Evaluations und Stats (`api/seed_mvp.py`).

## Start (lokal)
1) Backend
```bash
cd "/Users/vico/Neuer Ordner/api"
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed_mvp.py           # Seed anlegen
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2) Frontend
```bash
cd "/Users/vico/Neuer Ordner/web"
npm install
npm run dev
```

3) Browser
- Frontend: http://localhost:3000
- API-Health: http://127.0.0.1:8000/health

## Domainmodell (Kurz)
- Event/Tournament: id, name, country, start, end, venue_id, note
- Team: id, event_id, name, kit_color
- Player: id, name, birthdate, nation, plays_in, position, club, level, height, foot, note, photo_data, shortlisted
- RosterEntry: team_id, player_id, number
- Evaluation: event_id, player_id, scout_name, rating_(technique/physical/intelligence/mentality/impact), strengths, weaknesses, remarks, created_at
- ActionStat: event_id, player_id, minutes, shots, passes, duels, goals, assists

## Scoring-Modell
Implementierung in `api/main.py` -> `compute_score(evals, stats)`:
- Per-90 Normalisierung: goals, assists, shots, passes, duels.
- Sub-Indikatoren (0–100):
  - Technique: 60% Scout-Technik + Pässe/90 (capped)
  - Physical: 60% Scout-Physical + Duelle/90 (capped)
  - Intelligence: 80% Scout-Intelligence + Base 20
  - Mentality: 80% Scout-Mentality + Base 20
  - Impact: 50% Scout-Impact + Goals/90 (cap) + Assists/90 (cap)
- Overall: 25% Technique, 20% Physical, 20% Intelligence, 15% Mentality, 20% Impact.
- Endpoint: `GET /players/{id}/score` (optional `?event_id`).

## Wichtige Endpunkte (Backend)
- `GET /players` | `GET /players/{id}` | `POST /players` | `PUT /players/{id}` | `DELETE /players/{id}`
- `POST /players/{id}/shortlist?shortlisted=true|false`
- `GET /tournaments` | `POST /tournaments` | `PUT /tournaments/{id}`
- `POST /tournaments/{id}/teams` etc. (bestehend)
- Neu: `POST /evaluations`, `GET /players/{id}/evaluations`
- Neu: `POST /action-stats`, `GET /players/{id}/action-stats`
- Neu: `GET /players/{id}/score`

## Seed-Szenario
`python seed_mvp.py` erzeugt:
- Event "TalentLab Scouting Day"
- 2 Teams (Rot/Schwarz)
- 20 Spieler mit Position, kurzen Stats und Evaluations
- Beispiel-Shortlist (erste 4 Spieler)
