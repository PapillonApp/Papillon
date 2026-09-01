import { describe, expect, it } from "@jest/globals";

import { MyCpeCourseGrades } from "./models";
import { getMyCpeAcademicPeriod } from "./period";
import { mapMyCpeGrades, parseMyCpeNumber } from "./grades";

describe("My CPE grade mapping", () => {
  it.each([
    ["15,75", 15.75],
    [" 3 crédits ", 3],
    [12.5, 12.5],
    ["-", undefined],
    [undefined, undefined],
  ])("parses %p as %p", (input, expected) => {
    expect(parseMyCpeNumber(input)).toBe(expected);
  });

  it("maps subjects, credits, exams and aggregate averages", () => {
    const courses: MyCpeCourseGrades[] = [
      {
        id: 42,
        cours_code: "INFO-101",
        cours_libelle: "Algorithmique",
        inscription_cours: {
          nombre_credits_obtenus: "3",
          nombre_credits_potentiels: "5",
          moyenne: "14,5",
          est_validee: true,
        },
        epreuves: [
          {
            id: 100,
            libelle: "Partiel",
            date_debut_evt: "2026-01-10T08:00:00",
            date_obtention: "2026-01-15T12:00:00",
            note: "15,75",
            appreciation: ["Très bien"],
          },
          {
            id: 101,
            libelle: "Rattrapage",
            note: "-",
            est_absent: true,
            appreciation: ["Justificatif attendu"],
          },
          {
            id: 102,
            libelle: "Projet",
            note: "12",
            est_non_noter: true,
          },
        ],
      },
      {
        cours_code: "MATH-201",
        cours_libelle: "Mathématiques",
        inscription_cours: {
          moyenne: "10",
          est_validee: false,
        },
        epreuves: [],
      },
      {
        cours_code: "LANG-1",
        cours_libelle: "Anglais",
        inscription_cours: {},
      },
    ];

    const result = mapMyCpeGrades(courses, "service-account");

    expect(result.createdByAccount).toBe("service-account");
    expect(result.studentOverall).toMatchObject({
      value: 12.25,
      outOf: 20,
      disabled: false,
    });
    expect(result.classAverage).toMatchObject({ disabled: true, outOf: 20 });
    expect(result.subjects).toHaveLength(3);
    expect(result.subjects[0]).toMatchObject({
      id: "42",
      name: "Algorithmique",
      studentAverage: { value: 14.5, outOf: 20, status: "Validé" },
      classAverage: { disabled: true },
      credits: { value: 3, outOf: 5, status: "Validé" },
    });
    expect(result.subjects[1].studentAverage).toMatchObject({
      value: 10,
      status: "Non validé",
    });
    expect(result.subjects[2].studentAverage).toMatchObject({
      disabled: true,
    });

    const grades = result.subjects[0].grades ?? [];
    expect(grades[0]).toMatchObject({
      id: "100",
      subjectId: "42",
      subjectName: "Algorithmique",
      description: "Partiel",
      coefficient: 1,
      studentScore: {
        value: 15.75,
        outOf: 20,
        disabled: false,
        status: "Très bien",
      },
      createdByAccount: "service-account",
    });
    expect(grades[0].givenAt).toEqual(new Date("2026-01-15T12:00:00"));
    expect(grades[1].studentScore).toMatchObject({
      disabled: true,
      status: "Absent · Justificatif attendu",
    });
    expect(grades[2].studentScore).toMatchObject({
      value: 12,
      disabled: true,
      status: "Non noté",
    });
    expect(
      result.subjects
        .flatMap(subject => subject.grades ?? [])
        .every(grade => grade.createdByAccount === "service-account")
    ).toBe(true);
  });

  it("disables the overall score when no course average is available", () => {
    const result = mapMyCpeGrades(
      [{ cours_libelle: "Projet", epreuves: [] }],
      "service-account"
    );

    expect(result.studentOverall).toMatchObject({
      value: 0,
      disabled: true,
      status: "Non disponible",
    });
  });
});

describe("My CPE academic period", () => {
  it("covers the synthetic university year and uses the service account ID", () => {
    const winter = getMyCpeAcademicPeriod(
      "service-account",
      new Date(2026, 1, 15)
    );
    const autumn = getMyCpeAcademicPeriod(
      "service-account",
      new Date(2026, 8, 1)
    );

    expect(winter).toMatchObject({
      id: "mycpe-academic-year-2025-2026",
      name: "Année universitaire 2025-2026",
      createdByAccount: "service-account",
    });
    expect(winter.start).toEqual(new Date(2025, 8, 1));
    expect(winter.end).toEqual(new Date(2026, 7, 31, 23, 59, 59, 999));
    expect(autumn.name).toBe("Année universitaire 2026-2027");
  });
});
