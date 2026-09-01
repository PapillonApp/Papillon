import { describe, expect, it, jest } from "@jest/globals";

import { CourseStatus } from "@/services/shared/timetable";

import { MyCpeApiClient } from "./api";
import { MyCpePlanningEvent } from "./models";
import {
  fetchMyCpeTimetable,
  getMyCpeWeekRange,
  mapMyCpeCourseStatus,
  mapMyCpeTimetable,
} from "./timetable";

const event = (
  id: number,
  start: string,
  end: string,
  additions: Partial<MyCpePlanningEvent> = {}
): MyCpePlanningEvent => ({
  id,
  date_debut: start,
  date_fin: end,
  matiere: "Algorithmique",
  ...additions,
});

describe("My CPE timetable mapping", () => {
  it("builds a Monday-to-Sunday range from the supplied date", () => {
    const { start, end } = getMyCpeWeekRange(new Date(2026, 8, 2, 12));

    expect(start).toEqual(new Date(2026, 7, 31, 0, 0, 0, 0));
    expect(end).toEqual(new Date(2026, 8, 6, 23, 59, 59, 999));
  });

  it.each([
    ["Cours annulé", CourseStatus.CANCELED],
    ["Séance modifiée", CourseStatus.EDITED],
    ["Déplacé dans une autre salle", CourseStatus.EDITED],
    ["Cours à distance", CourseStatus.ONLINE],
    ["Confirmé", undefined],
  ])("maps status %s", (status, expected) => {
    expect(mapMyCpeCourseStatus(status)).toBe(expected);
  });

  it("filters placeholders and invalid dates, then groups and sorts courses", () => {
    const weekStart = new Date(2026, 7, 31);
    const events: MyCpePlanningEvent[] = [
      event(2, "2026-09-01T10:00:00", "2026-09-01T12:00:00", {
        matiere: "Mathématiques",
        type_activite: "CM",
        description: "Chapitre 1",
        statut_intervention: "Séance modifiée",
        intervenants: "Ada Lovelace",
        ressource: "Amphi A",
        salle: "Salle de secours",
      }),
      event(1, "2026-09-01T08:00:00", "2026-09-01T09:30:00", {
        matiere: "Réseaux",
        statut_intervention: "Distanciel",
      }),
      event(3, "2026-08-31T14:00:00", "2026-08-31T16:00:00", {
        matiere: undefined,
        type_activite: "Projet",
        salle: "Lab 2",
        statut_intervention: "Annulé",
      }),
      event(4, "2026-09-02T10:00:00", "2026-09-02T10:15:00", {
        is_break: true,
      }),
      event(5, "2026-09-03T10:00:00", "2026-09-03T11:00:00", {
        is_empty: true,
      }),
      event(6, "not-a-date", "2026-09-04T11:00:00"),
      event(7, "2026-09-04T12:00:00", "2026-09-04T11:00:00"),
      event(8, "2026-09-07T08:00:00", "2026-09-07T09:00:00"),
    ];

    const days = mapMyCpeTimetable(events, "service-account", weekStart);

    expect(days).toHaveLength(7);
    expect(days.map(day => day.date.getDay())).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(days.flatMap(day => day.courses)).toHaveLength(3);
    expect(days[0].courses[0]).toMatchObject({
      id: "3",
      subject: "Projet",
      room: "Lab 2",
      status: CourseStatus.CANCELED,
      customStatus: "Annulé",
      createdByAccount: "service-account",
    });
    expect(days[1].courses.map(course => course.id)).toEqual(["1", "2"]);
    expect(days[1].courses[0].status).toBe(CourseStatus.ONLINE);
    expect(days[1].courses[1]).toMatchObject({
      teacher: "Ada Lovelace",
      room: "Amphi A",
      additionalInfo: "CM · Chapitre 1",
      status: CourseStatus.EDITED,
      createdByAccount: "service-account",
    });
  });

  it("requests the exact Monday and Sunday API dates", async () => {
    const getPlanning = jest.fn(async () => []);
    const client = { getPlanning } as unknown as MyCpeApiClient;

    const days = await fetchMyCpeTimetable(
      client,
      "service-account",
      36,
      new Date(2026, 8, 2)
    );

    expect(getPlanning).toHaveBeenCalledWith("2026-08-31", "2026-09-06");
    expect(days).toHaveLength(7);
  });
});
