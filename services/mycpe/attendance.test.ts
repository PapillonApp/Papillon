import { describe, expect, it, jest } from "@jest/globals";

import { MyCpeApiClient } from "./api";
import { fetchMyCpeAttendance, mapMyCpeAttendance } from "./attendance";
import { MyCpeAbsencesResponse } from "./models";

const absencesResponse: MyCpeAbsencesResponse = {
  nbr_total_absence_excuser: 1,
  nbr_total_absence_non_excuser: 1,
  duree_totale_absence_excuser: "2h30",
  duree_totale_absence_non_excuser: "1h00",
  absences: [
    {
      id: 10,
      duree: "2h30",
      motif_absence: {
        id: 1,
        libelle: "Rendez-vous médical",
        est_excuser: true,
      },
      evenement: {
        date_debut: "2026-02-02T08:00:00",
        date_fin: "2026-02-02T10:30:00",
        intervenants: "Ada Lovelace",
        libelle_construit: "Cours d'algorithmique",
      },
    },
    {
      id: 11,
      motif_absence: { est_excuser: false },
      evenement: {
        date_debut: "2026-02-03T09:00:00",
        date_fin: "2026-02-03T10:00:00",
        libelle_construit: "Cours de mathématiques",
      },
    },
    {
      id: 12,
      motif_absence: { libelle: "Entrée invalide" },
      evenement: {
        date_debut: "not-a-date",
        date_fin: "2026-02-03T12:00:00",
      },
    },
  ],
};

describe("My CPE attendance mapping", () => {
  it("maps justified absences and computes durations from event dates", () => {
    const attendance = mapMyCpeAttendance(absencesResponse, "service-account");

    expect(attendance.createdByAccount).toBe("service-account");
    expect(attendance.absences).toHaveLength(2);
    expect(attendance.absences[0]).toMatchObject({
      id: "10",
      reason: "Rendez-vous médical",
      justified: true,
      timeMissed: 150,
      createdByAccount: "service-account",
    });
    expect(attendance.absences[0].from).toEqual(
      new Date("2026-02-02T08:00:00")
    );
    expect(attendance.absences[0].to).toEqual(new Date("2026-02-02T10:30:00"));
    expect(attendance.absences[1]).toMatchObject({
      id: "11",
      reason: "Cours de mathématiques",
      justified: false,
      timeMissed: 60,
      createdByAccount: "service-account",
    });
    expect(attendance.delays).toEqual([]);
    expect(attendance.punishments).toEqual([]);
    expect(attendance.observations).toEqual([]);
  });

  it("fetches absences through the injected API client", async () => {
    const getAbsences = jest.fn(async () => absencesResponse);
    const client = { getAbsences } as unknown as MyCpeApiClient;

    const attendance = await fetchMyCpeAttendance(client, "service-account");

    expect(getAbsences).toHaveBeenCalledTimes(1);
    expect(attendance.absences).toHaveLength(2);
  });
});
