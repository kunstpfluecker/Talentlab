import random
from datetime import date, timedelta
from uuid import uuid4

from sqlmodel import Session, select

from main import (
    Player,
    Tournament,
    Team,
    RosterEntry,
    Evaluation,
    ActionStat,
    create_db_and_tables,
    engine,
)


def random_birthdate(min_age=17, max_age=26):
    today = date.today()
    years = random.randint(min_age, max_age)
    days = random.randint(0, 364)
    return today.replace(year=today.year - years) - timedelta(days=days % 365)


def seed():
    create_db_and_tables()
    with Session(engine) as session:
        # Event
        event = Tournament(
            name="TalentLab Scouting Day",
            country="Deutschland",
            start=date.today(),
            end=date.today(),
            note="Demo-Event für Investoren",
        )
        session.add(event)
        session.commit()
        session.refresh(event)

        teams = []
        for name, color in [("Team Rot", "#e10600"), ("Team Schwarz", "#0d0d0f")]:
            t = Team(tournament_id=event.id, name=name, kit_color=color)
            session.add(t)
            session.commit()
            session.refresh(t)
            teams.append(t)

        first_names = ["Noah", "Liam", "Jaden", "Mika", "Finn", "Leo", "Jonas", "Luca", "Elias", "Ben",
                       "Julian", "Tim", "Marlon", "Samuel", "Nico", "Daniel", "Tobias", "Luis", "Fabian", "Max"]
        last_names = ["Kwan", "Faber", "Mensah", "Schmidt", "Keller", "Hofmann", "Schneider", "Becker", "Krause", "Berger",
                      "Müller", "Wagner", "Wolf", "Koch", "Richter", "Seidel", "Peters", "König", "Voigt", "Brandt"]
        positions = ["TW", "IV", "RV", "LV", "DM", "ZM", "OM", "RA", "LA", "ST"]

        players = []
        for i in range(20):
            fn = first_names[i % len(first_names)]
            ln = last_names[i % len(last_names)]
            p = Player(
                first_name=fn,
                last_name=ln,
                birthdate=random_birthdate(),
                nation="Deutschland",
                plays_in="Deutschland",
                position=random.choice(positions),
                club="Demo FC",
                level=str(random.randint(3, 6)),
                height=f"1,{random.randint(72, 90)} m",
                foot=random.choice(["Links", "Rechts", "Beidfüßig"]),
                note="Seed-Spieler",
                shortlisted=True if i < 4 else False,
            )
            session.add(p)
            session.commit()
            session.refresh(p)
            players.append(p)

            team = teams[i % 2]
            number = 2 + i
            session.add(RosterEntry(team_id=team.id, player_id=p.id, number=str(number)))
            session.commit()

            # Evaluations
            ev = Evaluation(
                event_id=event.id,
                player_id=p.id,
                scout_name="Scout A",
                rating_technique=random.randint(3, 5),
                rating_physical=random.randint(3, 5),
                rating_intelligence=random.randint(3, 5),
                rating_mentality=random.randint(3, 5),
                rating_impact=random.randint(3, 5),
                strengths="Spritzig, gute Übersicht",
                weaknesses="Konstanz verbessern",
                remarks="Seed-Datensatz",
            )
            session.add(ev)
            # Stats
            st = ActionStat(
                event_id=event.id,
                player_id=p.id,
                minutes=random.choice([45, 60, 75, 90]),
                shots=random.randint(0, 4),
                passes=random.randint(10, 40),
                duels=random.randint(5, 20),
                goals=random.randint(0, 2),
                assists=random.randint(0, 2),
            )
            session.add(st)
            session.commit()

        print("Seed abgeschlossen: Event, Teams, Spieler, Evaluations, Stats.")


if __name__ == "__main__":
    seed()
