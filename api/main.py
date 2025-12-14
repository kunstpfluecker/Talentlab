import os
import random
from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from sqlmodel import Field as SQLField, Session, SQLModel, create_engine, select
from pydantic_settings import BaseSettings


class Health(BaseModel):
    status: str
    service: str


class Player(SQLModel, table=True):
    id: UUID = SQLField(default_factory=uuid4, primary_key=True, index=True)
    unique_id: str = SQLField(default_factory=lambda: uuid4().hex, index=True, unique=True)
    first_name: str
    last_name: str
    birthdate: date
    nation: str
    plays_in: Optional[str] = None
    position: Optional[str] = None
    club: Optional[str] = None
    level: Optional[str] = None
    height: Optional[str] = None
    foot: Optional[str] = None
    note: Optional[str] = None
    photo_data: Optional[str] = None  # base64 or data URL placeholder
    shortlisted: bool = SQLField(default=False)
    created_at: datetime = SQLField(default_factory=datetime.utcnow)


class PlayerCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    firstName: str
    lastName: str
    birthdate: date
    nation: str
    playsIn: Optional[str] = None
    position: Optional[str] = None
    club: Optional[str] = None
    level: Optional[str] = None
    height: Optional[str] = None
    foot: Optional[str] = None
    note: Optional[str] = None
    photoData: Optional[str] = None
    shortlisted: Optional[bool] = None


class PlayerUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    birthdate: Optional[date] = None
    nation: Optional[str] = None
    playsIn: Optional[str] = None
    position: Optional[str] = None
    club: Optional[str] = None
    level: Optional[str] = None
    height: Optional[str] = None
    foot: Optional[str] = None
    note: Optional[str] = None
    photoData: Optional[str] = None
    shortlisted: Optional[bool] = None


class DeleteResponse(BaseModel):
    id: UUID


class RosterEntry(SQLModel, table=True):
    id: UUID = SQLField(default_factory=uuid4, primary_key=True, index=True)
    team_id: UUID = SQLField(index=True, foreign_key="team.id")
    player_id: UUID = SQLField(index=True, foreign_key="player.id")
    number: str


class Team(SQLModel, table=True):
    id: UUID = SQLField(default_factory=uuid4, primary_key=True, index=True)
    unique_id: str = SQLField(default_factory=lambda: uuid4().hex, index=True, unique=True)
    tournament_id: UUID = SQLField(index=True, foreign_key="tournament.id")
    name: str
    kit_color: Optional[str] = None


class TournamentParticipant(SQLModel, table=True):
    id: UUID = SQLField(default_factory=uuid4, primary_key=True, index=True)
    tournament_id: UUID = SQLField(index=True, foreign_key="tournament.id")
    player_id: UUID = SQLField(index=True, foreign_key="player.id")


class Game(SQLModel, table=True):
    id: UUID = SQLField(default_factory=uuid4, primary_key=True, index=True)
    tournament_id: UUID = SQLField(index=True, foreign_key="tournament.id")
    team_a_id: UUID = SQLField(index=True, foreign_key="team.id")
    team_b_id: Optional[UUID] = SQLField(default=None, index=True, foreign_key="team.id")
    kickoff: Optional[datetime] = None
    kit_a: Optional[str] = None
    kit_b: Optional[str] = None
    note: Optional[str] = None
    pitch_id: Optional[UUID] = SQLField(default=None, index=True, foreign_key="venuepitch.id")


class GameLineup(SQLModel, table=True):
    id: UUID = SQLField(default_factory=uuid4, primary_key=True, index=True)
    game_id: UUID = SQLField(index=True, foreign_key="game.id")
    player_id: UUID = SQLField(index=True, foreign_key="player.id")
    team_id: UUID = SQLField(index=True, foreign_key="team.id")
    number: str
    kit: Optional[str] = None
    position: Optional[str] = None


class GameVideo(SQLModel, table=True):
    id: UUID = SQLField(default_factory=uuid4, primary_key=True, index=True)
    game_id: UUID = SQLField(index=True, foreign_key="game.id")
    name: str
    status: str = "uploaded"


class RosterEntryCreate(BaseModel):
    playerId: UUID
    number: str


class TeamCreate(BaseModel):
    name: str
    kitColor: Optional[str] = None
    roster: List[RosterEntryCreate] = Field(default_factory=list)

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    kitColor: Optional[str] = None


class TeamRosterUpdate(BaseModel):
    roster: List[RosterEntryCreate] = Field(default_factory=list)


class Venue(SQLModel, table=True):
    id: UUID = SQLField(default_factory=uuid4, primary_key=True, index=True)
    name: str
    address: Optional[str] = None
    home_club: Optional[str] = None
    contact: Optional[str] = None
    price: Optional[str] = None
    note: Optional[str] = None
    photo_data: Optional[str] = None


class VenuePitch(SQLModel, table=True):
    id: UUID = SQLField(default_factory=uuid4, primary_key=True, index=True)
    venue_id: UUID = SQLField(index=True, foreign_key="venue.id")
    label: str
    surface: Optional[str] = None  # e.g., Rasen, Kunstrasen, Hartplatz
    lights: Optional[bool] = None


class VenuePitchCreate(BaseModel):
    label: str
    surface: Optional[str] = None
    lights: Optional[bool] = None


class VenueCreate(BaseModel):
    name: str
    address: Optional[str] = None
    homeClub: Optional[str] = None
    contact: Optional[str] = None
    price: Optional[str] = None
    note: Optional[str] = None
    photoData: Optional[str] = None
    pitches: List[VenuePitchCreate] = Field(default_factory=list)


class VenueUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    homeClub: Optional[str] = None
    contact: Optional[str] = None
    price: Optional[str] = None
    note: Optional[str] = None
    photoData: Optional[str] = None
    pitches: Optional[List[VenuePitchCreate]] = None

class TeamView(BaseModel):
    id: UUID
    name: str
    kitColor: Optional[str]
    roster: List[RosterEntryCreate]


class ParticipantUpdate(BaseModel):
    participants: List[UUID] = Field(default_factory=list)


class EvaluationCreate(BaseModel):
    eventId: UUID
    playerId: UUID
    scoutName: str = "Scout"
    ratingTechnique: int = 3
    ratingPhysical: int = 3
    ratingIntelligence: int = 3
    ratingMentality: int = 3
    ratingImpact: int = 3
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    remarks: Optional[str] = None


class ActionStatCreate(BaseModel):
    eventId: UUID
    playerId: UUID
    minutes: int = 0
    shots: int = 0
    passes: int = 0
    duels: int = 0
    goals: int = 0
    assists: int = 0


class Tournament(SQLModel, table=True):
    id: UUID = SQLField(default_factory=uuid4, primary_key=True, index=True)
    unique_id: str = SQLField(default_factory=lambda: uuid4().hex, index=True, unique=True)
    name: str
    country: str
    start: Optional[date] = None
    end: Optional[date] = None
    note: Optional[str] = None
    venue_id: Optional[UUID] = SQLField(default=None, index=True, foreign_key="venue.id")
    created_at: datetime = SQLField(default_factory=datetime.utcnow)


class Evaluation(SQLModel, table=True):
    id: UUID = SQLField(default_factory=uuid4, primary_key=True, index=True)
    event_id: UUID = SQLField(index=True, foreign_key="tournament.id")
    player_id: UUID = SQLField(index=True, foreign_key="player.id")
    scout_name: str = "Scout"
    rating_technique: int = 3
    rating_physical: int = 3
    rating_intelligence: int = 3
    rating_mentality: int = 3
    rating_impact: int = 3
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime = SQLField(default_factory=datetime.utcnow)


class ActionStat(SQLModel, table=True):
    id: UUID = SQLField(default_factory=uuid4, primary_key=True, index=True)
    event_id: UUID = SQLField(index=True, foreign_key="tournament.id")
    player_id: UUID = SQLField(index=True, foreign_key="player.id")
    minutes: int = 0
    shots: int = 0
    passes: int = 0
    duels: int = 0
    goals: int = 0
    assists: int = 0


class TournamentCreate(BaseModel):
    name: str
    country: Optional[str] = None
    start: Optional[date] = None
    end: Optional[date] = None
    note: Optional[str] = None
    venueId: Optional[UUID] = None
    participants: Optional[List[UUID]] = None


class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    start: Optional[date] = None
    end: Optional[date] = None
    note: Optional[str] = None
    venueId: Optional[UUID] = None


class ParticipantUpdate(BaseModel):
    participants: List[UUID] = Field(default_factory=list)


class GameCreate(BaseModel):
    teamAId: UUID
    teamBId: Optional[UUID] = None
    kickoff: Optional[datetime] = None
    kitA: Optional[str] = None
    kitB: Optional[str] = None
    note: Optional[str] = None
    pitchId: Optional[UUID] = None


class LineupEntry(BaseModel):
    playerId: UUID
    teamId: UUID
    number: str
    kit: Optional[str] = None
    position: Optional[str] = None


class LineupUpdate(BaseModel):
    lineup: List[LineupEntry]


class VideoUpdate(BaseModel):
    name: str
    status: str


class SeedRequest(BaseModel):
    count: int = 50
    min_age: int = 17
    max_age: int = 28


sqlite_url = "sqlite:///./db.sqlite"
engine = create_engine(sqlite_url, echo=False, connect_args={"check_same_thread": False})


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    # lightweight column migrations for Player extras
    with engine.connect() as conn:
        cols = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info('player')").fetchall()}
        if "position" not in cols:
            conn.exec_driver_sql("ALTER TABLE player ADD COLUMN position VARCHAR;")
        if "shortlisted" not in cols:
            conn.exec_driver_sql("ALTER TABLE player ADD COLUMN shortlisted BOOLEAN DEFAULT 0;")
        gcols = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info('game')").fetchall()}
        if "pitch_id" not in gcols:
            conn.exec_driver_sql("ALTER TABLE game ADD COLUMN pitch_id VARCHAR;")
        if "team_b_id" not in gcols:
            conn.exec_driver_sql("ALTER TABLE game ADD COLUMN team_b_id VARCHAR;")


def get_session():
    with Session(engine) as session:
        yield session


app = FastAPI(title="TalentLab API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/health", response_model=Health, tags=["meta"])
def health():
    return Health(status="ok", service="talentlab-api")


@app.get("/players", tags=["players"])
def list_players(session: Session = Depends(get_session)):
    players = session.exec(select(Player).order_by(Player.created_at.desc())).all()
    return [player_to_dict(p) for p in players]


@app.get("/players/{player_id}", tags=["players"])
def get_player(player_id: UUID, session: Session = Depends(get_session)):
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player_to_dict(player)


@app.post("/players", tags=["players"])
def create_player(payload: PlayerCreate, session: Session = Depends(get_session)):
    player = Player(
        first_name=payload.firstName,
        last_name=payload.lastName,
        birthdate=payload.birthdate,
        nation=payload.nation,
        plays_in=payload.playsIn,
        position=payload.position,
        club=payload.club,
        level=payload.level,
        height=payload.height,
        foot=payload.foot,
        note=payload.note,
        photo_data=payload.photoData,
        shortlisted=payload.shortlisted or False,
    )
    session.add(player)
    session.commit()
    session.refresh(player)
    return player_to_dict(player)


@app.put("/players/{player_id}", tags=["players"])
def update_player(player_id: UUID, payload: PlayerUpdate, session: Session = Depends(get_session)):
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    if payload.firstName is not None:
        player.first_name = payload.firstName
    if payload.lastName is not None:
        player.last_name = payload.lastName
    if payload.birthdate is not None:
        player.birthdate = payload.birthdate
    if payload.nation is not None:
        player.nation = payload.nation
    if payload.playsIn is not None:
        player.plays_in = payload.playsIn
    if payload.position is not None:
        player.position = payload.position
    if payload.club is not None:
        player.club = payload.club
    if payload.level is not None:
        player.level = payload.level
    if payload.height is not None:
        player.height = payload.height
    if payload.foot is not None:
        player.foot = payload.foot
    if payload.note is not None:
        player.note = payload.note
    if payload.photoData is not None:
        player.photo_data = payload.photoData
    if payload.shortlisted is not None:
        player.shortlisted = payload.shortlisted
    session.add(player)
    session.commit()
    session.refresh(player)
    return player_to_dict(player)


@app.delete("/players/{player_id}", tags=["players"], response_model=DeleteResponse)
def delete_player(player_id: UUID, session: Session = Depends(get_session)):
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    session.delete(player)
    session.commit()
    return DeleteResponse(id=player_id)


@app.post("/players/{player_id}/shortlist", tags=["players"])
def toggle_shortlist(player_id: UUID, shortlisted: bool = True, session: Session = Depends(get_session)):
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    player.shortlisted = bool(shortlisted)
    session.add(player)
    session.commit()
    session.refresh(player)
    return player_to_dict(player)


@app.get("/tournaments", tags=["tournaments"])
def list_tournaments(session: Session = Depends(get_session)):
    tournaments = session.exec(select(Tournament).order_by(Tournament.created_at.desc())).all()
    results = []
    for t in tournaments:
        teams = session.exec(select(Team).where(Team.tournament_id == t.id)).all()
        team_views: List[TeamView] = []
        for team in teams:
            roster_rows = session.exec(select(RosterEntry).where(RosterEntry.team_id == team.id)).all()
            roster_view = [RosterEntryCreate(playerId=row.player_id, number=row.number) for row in roster_rows]
            team_views.append(TeamView(id=team.id, name=team.name, kitColor=team.kit_color, roster=roster_view))
        participants = session.exec(select(TournamentParticipant).where(TournamentParticipant.tournament_id == t.id)).all()
        games = session.exec(select(Game).where(Game.tournament_id == t.id)).all()
        results.append(tournament_to_dict(t, team_views, participants, games, session))
    return results


@app.post("/tournaments", tags=["tournaments"])
def create_tournament(payload: TournamentCreate, session: Session = Depends(get_session)):
    tour = Tournament(
        name=payload.name,
        country=payload.country or "",
        start=payload.start,
        end=payload.end,
        note=payload.note,
        venue_id=payload.venueId,
    )
    session.add(tour)
    session.commit()
    session.refresh(tour)
    # participants
    for pid in payload.participants or []:
        session.add(TournamentParticipant(tournament_id=tour.id, player_id=pid))
    session.commit()
    return tournament_to_dict(tour, [], [], [], session)


@app.put("/tournaments/{tournament_id}", tags=["tournaments"])
def update_tournament(tournament_id: UUID, payload: TournamentUpdate, session: Session = Depends(get_session)):
    tour = session.get(Tournament, tournament_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if payload.name is not None:
        tour.name = payload.name
    if payload.country is not None:
        tour.country = payload.country
    if payload.start is not None:
        tour.start = payload.start
    if payload.end is not None:
        tour.end = payload.end
    if payload.note is not None:
        tour.note = payload.note
    if payload.venueId is not None:
        tour.venue_id = payload.venueId
    session.add(tour)
    session.commit()
    session.refresh(tour)
    teams = session.exec(select(Team).where(Team.tournament_id == tour.id)).all()
    team_views: List[TeamView] = []
    for tm in teams:
        roster_rows = session.exec(select(RosterEntry).where(RosterEntry.team_id == tm.id)).all()
        roster_view = [RosterEntryCreate(playerId=row.player_id, number=row.number) for row in roster_rows]
        team_views.append(TeamView(id=tm.id, name=tm.name, kitColor=tm.kit_color, roster=roster_view))
    participants = session.exec(select(TournamentParticipant).where(TournamentParticipant.tournament_id == tour.id)).all()
    games = session.exec(select(Game).where(Game.tournament_id == tour.id)).all()
    return tournament_to_dict(tour, team_views, participants, games, session)


@app.get("/tournaments/{tournament_id}", tags=["tournaments"])
def get_tournament(tournament_id: UUID, session: Session = Depends(get_session)):
    tour = session.get(Tournament, tournament_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tournament not found")
    teams = session.exec(select(Team).where(Team.tournament_id == tour.id)).all()
    team_views: List[TeamView] = []
    for tm in teams:
        roster_rows = session.exec(select(RosterEntry).where(RosterEntry.team_id == tm.id)).all()
        roster_view = [RosterEntryCreate(playerId=row.player_id, number=row.number) for row in roster_rows]
        team_views.append(TeamView(id=tm.id, name=tm.name, kitColor=tm.kit_color, roster=roster_view))
    participants = session.exec(select(TournamentParticipant).where(TournamentParticipant.tournament_id == tour.id)).all()
    games = session.exec(select(Game).where(Game.tournament_id == tour.id)).all()
    return tournament_to_dict(tour, team_views, participants, games, session)


@app.post("/tournaments/{tournament_id}/teams", tags=["teams"])
def add_team(tournament_id: UUID, payload: TeamCreate, session: Session = Depends(get_session)):
    tournament = session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    team = Team(
        tournament_id=tournament_id,
        name=payload.name,
        kit_color=payload.kitColor,
    )
    session.add(team)
    session.commit()
    session.refresh(team)
    # Add roster
    for entry in payload.roster:
        # basic duplicate check
        exists_number = session.exec(
            select(RosterEntry).where(RosterEntry.team_id == team.id, RosterEntry.number == entry.number)
        ).first()
        if exists_number:
            continue
        re = RosterEntry(team_id=team.id, player_id=entry.playerId, number=entry.number)
        session.add(re)
    session.commit()

    # Return updated tournament view
    teams = session.exec(select(Team).where(Team.tournament_id == tournament_id)).all()
    team_views: List[TeamView] = []
    for tm in teams:
        roster_rows = session.exec(select(RosterEntry).where(RosterEntry.team_id == tm.id)).all()
        roster_view = [RosterEntryCreate(playerId=row.player_id, number=row.number) for row in roster_rows]
        team_views.append(TeamView(id=tm.id, name=tm.name, kitColor=tm.kit_color, roster=roster_view))
    participants = session.exec(select(TournamentParticipant).where(TournamentParticipant.tournament_id == tournament_id)).all()
    games = session.exec(select(Game).where(Game.tournament_id == tournament_id)).all()
    return tournament_to_dict(tournament, team_views, participants, games, session)

@app.put("/tournaments/{tournament_id}/teams/{team_id}", tags=["teams"])
def update_team(tournament_id: UUID, team_id: UUID, payload: TeamUpdate, session: Session = Depends(get_session)):
    team = session.get(Team, team_id)
    if not team or team.tournament_id != tournament_id:
        raise HTTPException(status_code=404, detail="Team not found")
    if payload.name is not None:
        team.name = payload.name
    if payload.kitColor is not None:
        team.kit_color = payload.kitColor
    session.add(team)
    session.commit()
    tournament = session.get(Tournament, tournament_id)
    teams = session.exec(select(Team).where(Team.tournament_id == tournament_id)).all()
    team_views: List[TeamView] = []
    for tm in teams:
        roster_rows = session.exec(select(RosterEntry).where(RosterEntry.team_id == tm.id)).all()
        roster_view = [RosterEntryCreate(playerId=row.player_id, number=row.number) for row in roster_rows]
        team_views.append(TeamView(id=tm.id, name=tm.name, kitColor=tm.kit_color, roster=roster_view))
    participants = session.exec(select(TournamentParticipant).where(TournamentParticipant.tournament_id == tournament_id)).all()
    games = session.exec(select(Game).where(Game.tournament_id == tournament_id)).all()
    return tournament_to_dict(tournament, team_views, participants, games, session)


@app.put("/tournaments/{tournament_id}/teams/{team_id}/roster", tags=["teams"])
def update_team_roster(tournament_id: UUID, team_id: UUID, payload: TeamRosterUpdate, session: Session = Depends(get_session)):
    team = session.get(Team, team_id)
    if not team or team.tournament_id != tournament_id:
        raise HTTPException(status_code=404, detail="Team not found")
    # clear existing roster
    existing = session.exec(select(RosterEntry).where(RosterEntry.team_id == team_id)).all()
    for row in existing:
        session.delete(row)
    session.commit()
    # add new roster
    for entry in payload.roster:
        re = RosterEntry(team_id=team_id, player_id=entry.playerId, number=entry.number)
        session.add(re)
    session.commit()
    tournament = session.get(Tournament, tournament_id)
    teams = session.exec(select(Team).where(Team.tournament_id == tournament_id)).all()
    team_views: List[TeamView] = []
    for tm in teams:
        roster_rows = session.exec(select(RosterEntry).where(RosterEntry.team_id == tm.id)).all()
        roster_view = [RosterEntryCreate(playerId=row.player_id, number=row.number) for row in roster_rows]
        team_views.append(TeamView(id=tm.id, name=tm.name, kitColor=tm.kit_color, roster=roster_view))
    participants = session.exec(select(TournamentParticipant).where(TournamentParticipant.tournament_id == tournament_id)).all()
    games = session.exec(select(Game).where(Game.tournament_id == tournament_id)).all()
    return tournament_to_dict(tournament, team_views, participants, games, session)


@app.put("/tournaments/{tournament_id}/participants", tags=["tournaments"])
def update_participants(tournament_id: UUID, payload: ParticipantUpdate, session: Session = Depends(get_session)):
    tour = session.get(Tournament, tournament_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tournament not found")
    # clear
    existing = session.exec(select(TournamentParticipant).where(TournamentParticipant.tournament_id == tournament_id)).all()
    for row in existing:
        session.delete(row)
    session.commit()
    # add
    for pid in payload.participants:
        session.add(TournamentParticipant(tournament_id=tournament_id, player_id=pid))
    session.commit()
    teams = session.exec(select(Team).where(Team.tournament_id == tournament_id)).all()
    team_views: List[TeamView] = []
    for tm in teams:
        roster_rows = session.exec(select(RosterEntry).where(RosterEntry.team_id == tm.id)).all()
        roster_view = [RosterEntryCreate(playerId=row.player_id, number=row.number) for row in roster_rows]
        team_views.append(TeamView(id=tm.id, name=tm.name, kitColor=tm.kit_color, roster=roster_view))
    participants = session.exec(select(TournamentParticipant).where(TournamentParticipant.tournament_id == tournament_id)).all()
    games = session.exec(select(Game).where(Game.tournament_id == tournament_id)).all()
    return tournament_to_dict(tour, team_views, participants, games, session)


@app.delete("/tournaments/{tournament_id}/teams/{team_id}", tags=["teams"])
def delete_team(tournament_id: UUID, team_id: UUID, session: Session = Depends(get_session)):
    team = session.get(Team, team_id)
    if not team or team.tournament_id != tournament_id:
        raise HTTPException(status_code=404, detail="Team not found")
    # delete related roster
    roster_rows = session.exec(select(RosterEntry).where(RosterEntry.team_id == team_id)).all()
    for row in roster_rows:
        session.delete(row)
    # delete games involving this team
    games = session.exec(select(Game).where((Game.team_a_id == team_id) | (Game.team_b_id == team_id))).all()
    for g in games:
        # delete lineups and videos
        lineup_rows = session.exec(select(GameLineup).where(GameLineup.game_id == g.id)).all()
        for lr in lineup_rows:
            session.delete(lr)
        video_rows = session.exec(select(GameVideo).where(GameVideo.game_id == g.id)).all()
        for vr in video_rows:
            session.delete(vr)
        session.delete(g)
    session.delete(team)
    session.commit()
    tournament = session.get(Tournament, tournament_id)
    teams = session.exec(select(Team).where(Team.tournament_id == tournament_id)).all()
    team_views: List[TeamView] = []
    for tm in teams:
        roster_rows = session.exec(select(RosterEntry).where(RosterEntry.team_id == tm.id)).all()
        roster_view = [RosterEntryCreate(playerId=row.player_id, number=row.number) for row in roster_rows]
        team_views.append(TeamView(id=tm.id, name=tm.name, kitColor=tm.kit_color, roster=roster_view))
    participants = session.exec(select(TournamentParticipant).where(TournamentParticipant.tournament_id == tournament_id)).all()
    games = session.exec(select(Game).where(Game.tournament_id == tournament_id)).all()
    return tournament_to_dict(tournament, team_views, participants, games, session)


@app.put("/tournaments/{tournament_id}/participants", tags=["tournaments"])
def update_participants(tournament_id: UUID, payload: ParticipantUpdate, session: Session = Depends(get_session)):
    tournament = session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    # clear existing
    existing = session.exec(select(TournamentParticipant).where(TournamentParticipant.tournament_id == tournament_id)).all()
    for row in existing:
        session.delete(row)
    session.commit()
    for pid in payload.playerIds:
        tp = TournamentParticipant(tournament_id=tournament_id, player_id=pid)
        session.add(tp)
    session.commit()
    teams = session.exec(select(Team).where(Team.tournament_id == tournament_id)).all()
    team_views: List[TeamView] = []
    for tm in teams:
        roster_rows = session.exec(select(RosterEntry).where(RosterEntry.team_id == tm.id)).all()
        roster_view = [RosterEntryCreate(playerId=row.player_id, number=row.number) for row in roster_rows]
        team_views.append(TeamView(id=tm.id, name=tm.name, kitColor=tm.kit_color, roster=roster_view))
    participants = session.exec(select(TournamentParticipant).where(TournamentParticipant.tournament_id == tournament_id)).all()
    games = session.exec(select(Game).where(Game.tournament_id == tournament_id)).all()
    return tournament_to_dict(tournament, team_views, participants, games, session)


@app.post("/tournaments/{tournament_id}/games", tags=["games"])
def create_game(tournament_id: UUID, payload: GameCreate, session: Session = Depends(get_session)):
    tour = session.get(Tournament, tournament_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tournament not found")
    # validate timeframe if tour has dates
    if payload.kickoff and tour.start and tour.end:
        if not (tour.start <= payload.kickoff.date() <= tour.end):
            raise HTTPException(status_code=400, detail="Kickoff outside tournament range")
    if payload.pitchId:
        pitch = session.get(VenuePitch, payload.pitchId)
        if not pitch or (tour.venue_id and pitch.venue_id != tour.venue_id):
            raise HTTPException(status_code=400, detail="Pitch not valid for this tournament")
    team_b_value = payload.teamBId or payload.teamAId  # fallback for non-null constraint in existing DB
    game = Game(
        tournament_id=tournament_id,
        team_a_id=payload.teamAId,
        team_b_id=team_b_value,
        kickoff=payload.kickoff,
        kit_a=payload.kitA,
        kit_b=payload.kitB,
        note=payload.note,
        pitch_id=payload.pitchId,
    )
    session.add(game)
    session.commit()
    session.refresh(game)
    participants = session.exec(select(TournamentParticipant).where(TournamentParticipant.tournament_id == tournament_id)).all()
    teams = session.exec(select(Team).where(Team.tournament_id == tournament_id)).all()
    team_views: List[TeamView] = []
    for tm in teams:
        roster_rows = session.exec(select(RosterEntry).where(RosterEntry.team_id == tm.id)).all()
        roster_view = [RosterEntryCreate(playerId=row.player_id, number=row.number) for row in roster_rows]
        team_views.append(TeamView(id=tm.id, name=tm.name, kitColor=tm.kit_color, roster=roster_view))
    games = session.exec(select(Game).where(Game.tournament_id == tournament_id)).all()
    return tournament_to_dict(tour, team_views, participants, games, session)


@app.put("/tournaments/{tournament_id}/games/{game_id}/lineup", tags=["games"])
def update_lineup(tournament_id: UUID, game_id: UUID, payload: LineupUpdate, session: Session = Depends(get_session)):
    game = session.get(Game, game_id)
    if not game or game.tournament_id != tournament_id:
        raise HTTPException(status_code=404, detail="Game not found")
    existing = session.exec(select(GameLineup).where(GameLineup.game_id == game_id)).all()
    for row in existing:
        session.delete(row)
    session.commit()
    for entry in payload.lineup:
        gl = GameLineup(
            game_id=game_id,
            player_id=entry.playerId,
            team_id=entry.teamId,
            number=entry.number,
            kit=entry.kit,
            position=entry.position,
        )
        session.add(gl)
    session.commit()
    return {"id": str(game_id), "lineupCount": len(payload.lineup)}


@app.put("/tournaments/{tournament_id}/games/{game_id}/video", tags=["games"])
def update_video(tournament_id: UUID, game_id: UUID, payload: VideoUpdate, session: Session = Depends(get_session)):
    game = session.get(Game, game_id)
    if not game or game.tournament_id != tournament_id:
        raise HTTPException(status_code=404, detail="Game not found")
    video = GameVideo(game_id=game_id, name=payload.name, status=payload.status)
    session.add(video)
    session.commit()
    session.refresh(video)
    return {"id": str(video.id), "gameId": str(game_id), "status": video.status, "name": video.name}


@app.put("/tournaments/{tournament_id}/games/{game_id}", tags=["games"])
def update_game(tournament_id: UUID, game_id: UUID, payload: GameCreate, session: Session = Depends(get_session)):
    game = session.get(Game, game_id)
    if not game or game.tournament_id != tournament_id:
        raise HTTPException(status_code=404, detail="Game not found")
    tour = session.get(Tournament, tournament_id)
    if tour and payload.kickoff and tour.start and tour.end:
        if not (tour.start <= payload.kickoff.date() <= tour.end):
            raise HTTPException(status_code=400, detail="Kickoff outside tournament range")
    if payload.pitchId:
        pitch = session.get(VenuePitch, payload.pitchId)
        if not pitch or (tour and tour.venue_id and pitch.venue_id != tour.venue_id):
            raise HTTPException(status_code=400, detail="Pitch not valid for this tournament")
    team_b_value = payload.teamBId or payload.teamAId
    game.team_a_id = payload.teamAId
    game.team_b_id = team_b_value
    game.kickoff = payload.kickoff
    game.kit_a = payload.kitA
    game.kit_b = payload.kitB
    game.note = payload.note
    game.pitch_id = payload.pitchId
    session.add(game)
    session.commit()
    return {"id": str(game.id)}


@app.delete("/tournaments/{tournament_id}/games/{game_id}", tags=["games"])
def delete_game(tournament_id: UUID, game_id: UUID, session: Session = Depends(get_session)):
    game = session.get(Game, game_id)
    if not game or game.tournament_id != tournament_id:
        raise HTTPException(status_code=404, detail="Game not found")
    lineup_rows = session.exec(select(GameLineup).where(GameLineup.game_id == game_id)).all()
    for lr in lineup_rows:
        session.delete(lr)
    video_rows = session.exec(select(GameVideo).where(GameVideo.game_id == game_id)).all()
    for vr in video_rows:
        session.delete(vr)
    session.delete(game)
    session.commit()
    return {"id": str(game_id)}


@app.get("/tournaments/{tournament_id}/games", tags=["games"])
def list_games(tournament_id: UUID, session: Session = Depends(get_session)):
    games = session.exec(select(Game).where(Game.tournament_id == tournament_id)).all()
    return [
        {
            "id": str(g.id),
            "teamAId": str(g.team_a_id),
            "teamBId": str(g.team_b_id) if g.team_b_id else None,
            "kickoff": g.kickoff.isoformat() if g.kickoff else None,
            "kitA": g.kit_a,
            "kitB": g.kit_b,
            "note": g.note,
            "pitchId": str(g.pitch_id) if g.pitch_id else None,
        }
        for g in games
    ]



@app.delete("/tournaments/{tournament_id}", tags=["tournaments"])
def delete_tournament(tournament_id: UUID, session: Session = Depends(get_session)):
    tour = session.get(Tournament, tournament_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tournament not found")
    # delete participants
    part_rows = session.exec(select(TournamentParticipant).where(TournamentParticipant.tournament_id == tournament_id)).all()
    for pr in part_rows:
        session.delete(pr)
    # delete games (with children)
    games = session.exec(select(Game).where(Game.tournament_id == tournament_id)).all()
    for g in games:
        lineup_rows = session.exec(select(GameLineup).where(GameLineup.game_id == g.id)).all()
        for lr in lineup_rows:
            session.delete(lr)
        video_rows = session.exec(select(GameVideo).where(GameVideo.game_id == g.id)).all()
        for vr in video_rows:
            session.delete(vr)
        session.delete(g)
    # delete teams and rosters
    teams = session.exec(select(Team).where(Team.tournament_id == tournament_id)).all()
    for tm in teams:
        roster_rows = session.exec(select(RosterEntry).where(RosterEntry.team_id == tm.id)).all()
        for rr in roster_rows:
            session.delete(rr)
        session.delete(tm)
    session.delete(tour)
    session.commit()
    return {"id": str(tournament_id)}


def random_birthdate(min_age: int, max_age: int) -> date:
    today = date.today()
    years = random.randint(min_age, max_age)
    days = random.randint(0, 364)
    target_year = today.year - years
    # handle leap years by clamping
    try:
        return today.replace(year=target_year) - timedelta(days=days % 365)
    except ValueError:
        return today.replace(year=target_year, day=28, month=2) - timedelta(days=days % 365)


def seed_players(session: Session, count: int = 50, min_age: int = 17, max_age: int = 28) -> int:
    first_names = [
        "Noah", "Liam", "Jaden", "Mika", "Finn", "Leo", "Jonas", "Luca", "Elias", "Ben",
        "Julian", "Tim", "Marlon", "Samuel", "Nico", "Daniel", "Tobias", "Luis", "Fabian", "Max",
        "Aaron", "Bastian", "Cedric", "Dominik", "Erik", "Florian", "Gideon", "Henrik", "Ilja", "Jan",
        "Kilian", "Laurin", "Mathis", "Nathan", "Ole", "Philipp", "Quentin", "Rafael", "Sven", "Timo",
        "Valentin", "Yannic", "Zeno", "Arda", "Can", "Emre", "Mehmet", "Serkan", "Ilias", "Hakim",
    ]
    last_names = [
        "Kwan", "Faber", "Mensah", "Schmidt", "Keller", "Hofmann", "Schneider", "Becker", "Krause", "Berger",
        "Müller", "Wagner", "Wolf", "Koch", "Richter", "Seidel", "Peters", "König", "Voigt", "Brandt",
        "Aydin", "Demir", "Yildiz", "Öztürk", "Schulz", "Zimmermann", "Weber", "Fuchs", "Lang", "Vogel",
        "Lehmann", "Kaiser", "Graf", "Arnold", "Barth", "Franke", "Haas", "Maier", "Winter", "Lorenz",
    ]
    nations = ["Deutschland", "Österreich", "Schweiz", "Frankreich", "Ghana", "Niederlande", "Belgien", "Spanien", "Italien", "Polen"]
    plays_in = ["Deutschland", "Österreich", "Schweiz", "Frankreich"]
    clubs = [
        "SV Waldhof Mannheim", "Fortuna Köln", "SV Babelsberg 03", "Hallescher FC", "FSV Frankfurt",
        "Rot-Weiss Essen", "Viktoria Köln", "1860 München", "Chemnitzer FC", "Kickers Offenbach",
    ]
    feet = ["Links", "Rechts", "Beidfüßig"]
    notes = [
        "Pressingresistenz, progressive Pässe",
        "Tempo im Umschalten, inverse Läufe",
        "Stark im 1v1, guter erster Kontakt",
        "Diagonalbälle, ruhiger Aufbau",
        "Hohe Laufleistung, aggressives Gegenpressing",
        "Strafraumpräsenz, Abschluss beidfüßig",
        "Ballnahes Pressing, gutes Timing",
        "Enge Ballführung, zieht nach innen",
        "Robust im Zweikampf, Kopfballstark",
        "Strategisches Positionsspiel, scanning gut",
    ]

    created = 0
    attempts = 0
    target_attempts = count * 3

    while created < count and attempts < target_attempts:
        attempts += 1
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        nat = random.choice(nations)
        play_country = random.choice(plays_in)
        club = random.choice(clubs)
        level = str(random.randint(1, 6))
        height = f"1,{random.randint(70, 92)} m"
        foot = random.choice(feet)
        bd = random_birthdate(min_age=min_age, max_age=max_age)
        note = random.choice(notes)

        dup = session.exec(
            select(Player).where(
                Player.first_name == fn,
                Player.last_name == ln,
                Player.birthdate == bd,
            )
        ).first()
        if dup:
            continue

        player = Player(
            first_name=fn,
            last_name=ln,
            birthdate=bd,
            nation=nat,
            plays_in=play_country,
            club=club,
            level=level,
            height=height,
            foot=foot,
            note=note,
        )
        session.add(player)
        created += 1
    session.commit()
    return created


@app.post("/ops/seed-players", tags=["ops"])
def ops_seed_players(payload: SeedRequest, request: Request, session: Session = Depends(get_session)):
    created = seed_players(session, count=payload.count, min_age=payload.min_age, max_age=payload.max_age)
    return {"created": created, "requested": payload.count}


@app.post("/ops/dedupe-players", tags=["ops"])
def ops_dedupe_players(request: Request, session: Session = Depends(get_session)):
    """
    Entfernt doppelte Spieler basierend auf Vor- und Nachname (case-insensitiv).
    Behalten wird jeweils der älteste Eintrag (created_at); alle anderen mit gleichem Namen werden gelöscht.
    Referenzen in Roster/Evaluations/ActionStats/Turnier-Teilnahmen/Lineups werden vorher entfernt.
    """
    players = session.exec(select(Player).order_by(Player.created_at.asc())).all()
    seen: Dict[str, Player] = {}
    to_delete: List[Player] = []
    for p in players:
        key = f"{p.first_name.strip().lower()}::{p.last_name.strip().lower()}"
        if key not in seen:
            seen[key] = p
        else:
            to_delete.append(p)

    removed = 0
    for dup in to_delete:
        for model in (RosterEntry, TournamentParticipant, Evaluation, ActionStat, GameLineup):
            rows = session.exec(select(model).where(model.player_id == dup.id)).all()
            for row in rows:
                session.delete(row)
        session.delete(dup)
        removed += 1
    session.commit()
    return {"removed": removed, "kept": len(seen)}


@app.get("/venues", tags=["venues"])
def list_venues(session: Session = Depends(get_session)):
    venues = session.exec(select(Venue)).all()
    results = []
    for v in venues:
        pitches = session.exec(select(VenuePitch).where(VenuePitch.venue_id == v.id)).all()
        results.append({
            "id": str(v.id),
            "name": v.name,
            "address": v.address,
            "homeClub": v.home_club,
            "contact": v.contact,
            "price": v.price,
            "note": v.note,
            "photoData": v.photo_data,
            "pitches": [
                {"id": str(p.id), "label": p.label, "surface": p.surface, "lights": p.lights}
                for p in pitches
            ],
        })
    return results

@app.get("/venues/{venue_id}", tags=["venues"])
def get_venue(venue_id: UUID, session: Session = Depends(get_session)):
    v = session.get(Venue, venue_id)
    if not v:
        raise HTTPException(status_code=404, detail="Venue not found")
    pitches = session.exec(select(VenuePitch).where(VenuePitch.venue_id == v.id)).all()
    return {
        "id": str(v.id),
        "name": v.name,
        "address": v.address,
        "homeClub": v.home_club,
        "contact": v.contact,
        "price": v.price,
        "note": v.note,
        "photoData": v.photo_data,
        "pitches": [
            {"id": str(p.id), "label": p.label, "surface": p.surface, "lights": p.lights}
            for p in pitches
        ],
    }


@app.post("/venues", tags=["venues"])
def create_venue(payload: VenueCreate, session: Session = Depends(get_session)):
    v = Venue(
        name=payload.name,
        address=payload.address,
        home_club=payload.homeClub,
        contact=payload.contact,
        price=payload.price,
        note=payload.note,
        photo_data=payload.photoData,
    )
    session.add(v)
    session.commit()
    session.refresh(v)
    for pitch in payload.pitches:
        session.add(VenuePitch(venue_id=v.id, label=pitch.label, surface=pitch.surface, lights=pitch.lights))
    session.commit()
    return list_venues(session)


@app.put("/venues/{venue_id}", tags=["venues"])
def update_venue(venue_id: UUID, payload: VenueUpdate, session: Session = Depends(get_session)):
    v = session.get(Venue, venue_id)
    if not v:
        raise HTTPException(status_code=404, detail="Venue not found")
    if payload.name is not None:
        v.name = payload.name
    if payload.address is not None:
        v.address = payload.address
    if payload.homeClub is not None:
        v.home_club = payload.homeClub
    if payload.contact is not None:
        v.contact = payload.contact
    if payload.price is not None:
        v.price = payload.price
    if payload.note is not None:
        v.note = payload.note
    if payload.photoData is not None:
        v.photo_data = payload.photoData
    session.add(v)
    session.commit()
    if payload.pitches is not None:
        existing = session.exec(select(VenuePitch).where(VenuePitch.venue_id == v.id)).all()
        for row in existing:
            session.delete(row)
        session.commit()
        for pitch in payload.pitches:
            session.add(VenuePitch(venue_id=v.id, label=pitch.label, surface=pitch.surface, lights=pitch.lights))
        session.commit()
    return list_venues(session)


@app.delete("/venues/{venue_id}", tags=["venues"])
def delete_venue(venue_id: UUID, session: Session = Depends(get_session)):
    v = session.get(Venue, venue_id)
    if not v:
        raise HTTPException(status_code=404, detail="Venue not found")
    pitches = session.exec(select(VenuePitch).where(VenuePitch.venue_id == venue_id)).all()
    for p in pitches:
        session.delete(p)
    # unset venue on tournaments
    tournaments = session.exec(select(Tournament).where(Tournament.venue_id == venue_id)).all()
    for t in tournaments:
        t.venue_id = None
        session.add(t)
    session.delete(v)
    session.commit()
    return {"id": str(venue_id)}


@app.post("/evaluations", tags=["evaluations"])
def create_evaluation(payload: EvaluationCreate, session: Session = Depends(get_session)):
    ev = Evaluation(
        event_id=payload.eventId,
        player_id=payload.playerId,
        scout_name=payload.scoutName,
        rating_technique=payload.ratingTechnique,
        rating_physical=payload.ratingPhysical,
        rating_intelligence=payload.ratingIntelligence,
        rating_mentality=payload.ratingMentality,
        rating_impact=payload.ratingImpact,
        strengths=payload.strengths,
        weaknesses=payload.weaknesses,
        remarks=payload.remarks,
    )
    session.add(ev)
    session.commit()
    session.refresh(ev)
    return {"id": str(ev.id)}


@app.get("/players/{player_id}/evaluations", tags=["evaluations"])
def list_evaluations(player_id: UUID, session: Session = Depends(get_session)):
    rows = session.exec(select(Evaluation).where(Evaluation.player_id == player_id).order_by(Evaluation.created_at.desc())).all()
    return [
        {
            "id": str(r.id),
            "eventId": str(r.event_id),
            "playerId": str(r.player_id),
            "scoutName": r.scout_name,
            "ratingTechnique": r.rating_technique,
            "ratingPhysical": r.rating_physical,
            "ratingIntelligence": r.rating_intelligence,
            "ratingMentality": r.rating_mentality,
            "ratingImpact": r.rating_impact,
            "strengths": r.strengths,
            "weaknesses": r.weaknesses,
            "remarks": r.remarks,
            "createdAt": r.created_at.isoformat(),
        }
        for r in rows
    ]


@app.post("/action-stats", tags=["stats"])
def create_action_stat(payload: ActionStatCreate, session: Session = Depends(get_session)):
    st = ActionStat(
        event_id=payload.eventId,
        player_id=payload.playerId,
        minutes=payload.minutes,
        shots=payload.shots,
        passes=payload.passes,
        duels=payload.duels,
        goals=payload.goals,
        assists=payload.assists,
    )
    session.add(st)
    session.commit()
    session.refresh(st)
    return {"id": str(st.id)}


@app.get("/players/{player_id}/action-stats", tags=["stats"])
def list_action_stats(player_id: UUID, session: Session = Depends(get_session)):
    rows = session.exec(select(ActionStat).where(ActionStat.player_id == player_id)).all()
    return [
        {
            "id": str(r.id),
            "eventId": str(r.event_id),
            "playerId": str(r.player_id),
            "minutes": r.minutes,
            "shots": r.shots,
            "passes": r.passes,
            "duels": r.duels,
            "goals": r.goals,
            "assists": r.assists,
        }
        for r in rows
    ]


@app.get("/players/{player_id}/score", tags=["scoring"])
def get_player_score(player_id: UUID, event_id: Optional[UUID] = None, session: Session = Depends(get_session)):
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    ev_query = select(Evaluation).where(Evaluation.player_id == player_id)
    st_query = select(ActionStat).where(ActionStat.player_id == player_id)
    if event_id:
        ev_query = ev_query.where(Evaluation.event_id == event_id)
        st_query = st_query.where(ActionStat.event_id == event_id)
    evals = session.exec(ev_query).all()
    stats = session.exec(st_query).all()
    return compute_score(evals, stats)

def player_to_dict(p: Player) -> dict:
    return {
        "id": str(p.id),
        "uniqueId": p.unique_id,
        "firstName": p.first_name,
        "lastName": p.last_name,
        "birthdate": p.birthdate.isoformat(),
        "nation": p.nation,
        "playsIn": p.plays_in,
        "position": p.position,
        "club": p.club,
        "level": p.level,
        "height": p.height,
        "foot": p.foot,
        "note": p.note,
        "photoData": p.photo_data,
        "shortlisted": p.shortlisted,
        "createdAt": p.created_at.isoformat(),
    }

def tournament_to_dict(
    t: Tournament,
    teams: List[TeamView],
    participants: Optional[List[TournamentParticipant]] = None,
    games: Optional[List[Game]] = None,
    session: Optional[Session] = None,
) -> dict:
    venue_dict = None
    if session and t.venue_id:
        venue = session.get(Venue, t.venue_id)
        if venue:
          pitches = session.exec(select(VenuePitch).where(VenuePitch.venue_id == venue.id)).all()
          venue_dict = {
              "id": str(venue.id),
              "name": venue.name,
              "address": venue.address,
              "homeClub": venue.home_club,
              "contact": venue.contact,
              "price": venue.price,
              "note": venue.note,
              "photoData": venue.photo_data,
              "pitches": [
                  {"id": str(p.id), "label": p.label, "surface": p.surface, "lights": p.lights}
                  for p in pitches
              ],
          }

    def game_to_dict(g: Game) -> dict:
        lineup_rows: List[GameLineup] = []
        video_rows: List[GameVideo] = []
        if session:
            lineup_rows = session.exec(select(GameLineup).where(GameLineup.game_id == g.id)).all()
            video_rows = session.exec(select(GameVideo).where(GameVideo.game_id == g.id)).all()
        return {
            "id": str(g.id),
            "teamAId": str(g.team_a_id),
            "teamBId": str(g.team_b_id) if g.team_b_id else None,
            "kickoff": g.kickoff.isoformat() if g.kickoff else None,
            "kitA": g.kit_a,
            "kitB": g.kit_b,
            "note": g.note,
            "pitchId": str(g.pitch_id) if g.pitch_id else None,
            "lineup": [
                {
                    "playerId": str(l.player_id),
                    "teamId": str(l.team_id),
                    "number": l.number,
                    "kit": l.kit,
                    "position": l.position,
                }
                for l in lineup_rows
            ],
            "videos": [
                {
                    "id": str(v.id),
                    "name": v.name,
                    "status": v.status,
                }
                for v in video_rows
            ],
        }

    return {
        "id": str(t.id),
        "uniqueId": t.unique_id,
        "name": t.name,
        "country": t.country,
        "start": t.start.isoformat() if t.start else None,
        "end": t.end.isoformat() if t.end else None,
        "note": t.note,
        "teams": [
          {"id": str(team.id), "uniqueId": getattr(team, "unique_id", None), "name": team.name, "kitColor": team.kitColor, "roster": [{"playerId": str(r.playerId), "number": r.number} for r in team.roster]}
          for team in teams
        ],
        "participants": [str(p.player_id) for p in participants or []],
        "games": [game_to_dict(g) for g in games or []],
        "venue": venue_dict,
    }


def per90(value: int, minutes: int) -> float:
    if minutes <= 0:
        return 0.0
    return (value / minutes) * 90.0


def compute_score(evals: List[Evaluation], stats: List[ActionStat]) -> Dict[str, Any]:
    # Aggregate ratings
    if evals:
        avg = lambda attr: sum(getattr(e, attr) for e in evals) / len(evals)
    else:
        avg = lambda attr: 3.0
    rt = avg("rating_technique")
    rp = avg("rating_physical")
    ri = avg("rating_intelligence")
    rm = avg("rating_mentality")
    rimp = avg("rating_impact")

    total_minutes = sum(s.minutes for s in stats) or 0
    goals_p90 = per90(sum(s.goals for s in stats), total_minutes)
    assists_p90 = per90(sum(s.assists for s in stats), total_minutes)
    shots_p90 = per90(sum(s.shots for s in stats), total_minutes)
    passes_p90 = per90(sum(s.passes for s in stats), total_minutes)
    duels_p90 = per90(sum(s.duels for s in stats), total_minutes)

    # Sub-indicators 0-100
    technique = min(100, (rt / 5) * 60 + min(40, passes_p90 * 4))
    physical = min(100, (rp / 5) * 60 + min(40, duels_p90 * 4))
    intelligence = min(100, (ri / 5) * 80 + 20)  # mainly rating
    mentality = min(100, (rm / 5) * 80 + 20)
    impact = min(100, (rimp / 5) * 50 + min(30, goals_p90 * 10) + min(20, assists_p90 * 10))

    # Overall weighted
    overall = round(
        0.25 * technique +
        0.2 * physical +
        0.2 * intelligence +
        0.15 * mentality +
        0.2 * impact,
        2,
    )

    return {
        "score": overall,
        "subIndicators": {
            "technique": round(technique, 1),
            "physical": round(physical, 1),
            "intelligence": round(intelligence, 1),
            "mentality": round(mentality, 1),
            "impact": round(impact, 1),
        },
        "explain": {
            "ratings": {
                "technique": rt,
                "physical": rp,
                "intelligence": ri,
                "mentality": rm,
                "impact": rimp,
            },
            "per90": {
                "goals": round(goals_p90, 2),
                "assists": round(assists_p90, 2),
                "shots": round(shots_p90, 2),
                "passes": round(passes_p90, 2),
                "duels": round(duels_p90, 2),
                "minutes": total_minutes,
            },
            "weights": {
                "technique": "60% scout technique + passes/90 capped 40",
                "physical": "60% scout physical + duels/90 capped 40",
                "intelligence": "80% scout intelligence, base 20",
                "mentality": "80% scout mentality, base 20",
                "impact": "50% scout impact + goals/90 (10 each, cap 30) + assists/90 (10 each, cap 20)",
                "overall": "25% technique, 20% physical, 20% intelligence, 15% mentality, 20% impact",
            },
        },
    }
