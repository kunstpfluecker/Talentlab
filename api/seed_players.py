import random
from datetime import date, timedelta

from sqlmodel import Session, select

from main import Player, create_db_and_tables, engine


def random_birthdate(min_age=17, max_age=28):
    today = date.today()
    years = random.randint(min_age, max_age)
    # random day within the year
    days = random.randint(0, 364)
    return today.replace(year=today.year - years) - timedelta(days=days % 365)


def main():
    create_db_and_tables()

    first_names = [
        "Noah", "Liam", "Jaden", "Mika", "Finn", "Leo", "Jonas", "Luca", "Elias", "Ben",
        "Julian", "Tim", "Marlon", "Samuel", "Nico", "Daniel", "Tobias", "Luis", "Fabian", "Max",
    ]
    last_names = [
        "Kwan", "Faber", "Mensah", "Schmidt", "Keller", "Hofmann", "Schneider", "Becker", "Krause", "Berger",
        "Müller", "Wagner", "Wolf", "Koch", "Richter", "Seidel", "Peters", "König", "Voigt", "Brandt",
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
    target = 100

    with Session(engine) as session:
        existing = session.exec(select(Player)).all()
        if len(existing) >= target:
            print(f"{len(existing)} Spieler existieren bereits. Seed wird übersprungen.")
            return

        while created < target:
            fn = random.choice(first_names)
            ln = random.choice(last_names)
            nat = random.choice(nations)
            play_country = random.choice(plays_in)
            club = random.choice(clubs)
            level = str(random.randint(1, 6))
            height = f"1,{random.randint(70, 92)} m"
            foot = random.choice(feet)
            bd = random_birthdate()
            note = random.choice(notes)

            # Avoid duplicate exact matches
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
    print(f"{created} Spieler angelegt.")


if __name__ == "__main__":
    main()
