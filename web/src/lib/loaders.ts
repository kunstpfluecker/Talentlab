import { fetchPlayers, fetchTournaments, fetchVenues } from "./api";
import { Player, Tournament, Venue } from "../types";

type LoadArgs = {
  setPlayers: (p: Player[]) => void;
  setTournaments: (t: Tournament[]) => void;
  setVenues: (v: Venue[]) => void;
  setSelectedTournamentId: (id: string) => void;
  setVenueForm: (v: Venue) => void;
  venueFormId: string;
};

export async function loadAll({
  setPlayers,
  setTournaments,
  setVenues,
  setSelectedTournamentId,
  setVenueForm,
  venueFormId,
}: LoadArgs) {
  const [pData, tData, vData] = await Promise.all([
    fetchPlayers(),
    fetchTournaments(),
    fetchVenues(),
  ]);

  setPlayers(
    pData.map((p: any) => ({
      id: p.id,
      uniqueId: p.uniqueId,
      firstName: p.firstName,
      lastName: p.lastName,
      birthdate: p.birthdate,
      nation: p.nation,
      playsIn: p.playsIn,
      club: p.club,
      level: p.level,
      height: p.height,
      foot: p.foot,
      note: p.note,
      photoData: p.photoData,
    })),
  );

  setTournaments(
    tData.map((t: any) => ({
      id: t.id,
      uniqueId: t.uniqueId,
      name: t.name,
      country: t.country,
      start: t.start,
      end: t.end,
      note: t.note,
      venue: t.venue,
      participants: t.participants || [],
      teams: (t.teams || []).map((team: any) => ({
        id: team.id,
        name: team.name,
        kitColor: team.kitColor,
        roster: team.roster || [],
      })),
      games: (t.games || []).map((g: any) => ({
        id: g.id,
        teamAId: g.teamAId,
        teamBId: g.teamBId,
        kickoff: g.kickoff,
        kitA: g.kitA,
        kitB: g.kitB,
        note: g.note,
        lineup: g.lineup || [],
        videos: g.videos || [],
      })),
    })),
  );
  if (tData[0]?.id) setSelectedTournamentId(tData[0].id);

  setVenues(
    vData.map((v: any) => ({
      id: v.id,
      name: v.name,
      address: v.address,
      homeClub: v.homeClub,
      contact: v.contact,
      price: v.price,
      note: v.note,
      photoData: v.photoData,
      pitches: v.pitches || [],
    })),
  );
  if (vData[0] && !venueFormId) {
    setVenueForm({
      id: vData[0].id,
      name: vData[0].name,
      address: vData[0].address || "",
      homeClub: vData[0].homeClub || "",
      contact: vData[0].contact || "",
      price: vData[0].price || "",
      note: vData[0].note || "",
      photoData: vData[0].photoData || "",
      pitches: vData[0].pitches || [],
    });
  }
}
