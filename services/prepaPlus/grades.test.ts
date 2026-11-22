import { expect, test } from "@jest/globals";
import {
  parseWrittenGrades,
  parseOralGrades,
  makePeriodGrades,
} from "./grades";

test("maps French decimal marks, written subjects, and oral assessments", () => {
  const written = parseWrittenGrades(
    `
    <div class="cell"><h4>PHYSIQUE</h4></div><div class="cell"><table>
    <tr><th>Période</th><th>Devoir</th><th>Thème</th><th>Date</th><th>Note</th><th>Rang</th><th>Total</th><th>Moyenne classe</th><th>Ecart-type</th></tr>
    <tr><td>Premier semestre</td><td>DS 1</td><td>Optique</td><td>16 octobre 2026</td><td>12,5</td><td>3</td><td>20</td><td>10,5</td><td>2</td></tr>
    <tr><td>Premier semestre</td><td>DS 2</td><td></td><td>23 octobre 2026</td><td>&nbsp;</td><td></td><td>20</td><td>12</td><td>2</td></tr>
    </table></div>`,
    "plus"
  );
  const oral = parseOralGrades(
    `<table><tr><th>Semaine</th><th>MATHS</th></tr><tr><th>S4: 21/09-25/09</th>
    <td><span title="Professeur; Rg:2/15; Moy:11,5">14</span></td></tr></table>`,
    new Date(2026, 9, 16),
    "plus"
  );
  const grades = makePeriodGrades([...written, ...oral], "plus");
  expect(
    grades.subjects
      .flatMap(subject => subject.grades ?? [])
      .map(grade => [grade.subjectName, grade.studentScore?.value])
  ).toEqual([
    ["PHYSIQUE", 12.5],
    ["MATHS", 14],
  ]);
});
