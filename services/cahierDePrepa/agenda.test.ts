import { expect, test } from "@jest/globals";
import { mapWeeklyAgenda, cahierWeek } from "./agenda";

test("parses native weekly agenda articles and hour-only times", () => {
  const monday = new Date(2026, 10, 16);
  expect(cahierWeek(monday)).toBe("26114");
  const days = mapWeeklyAgenda(
    `
    <div id="calendrier"></div>
    <article data-id="13"><h3 class="titreagenda">Le lundi 16 novembre 2026 de 8h à 9h30</h3><h4>Cours en Mathématiques</h4><p>Salle 4</p></article>
    <article data-id="14"><h3 class="titreagenda">Le lundi 23 novembre 2026 de 9h à 10h</h3><h4>Next week</h4></article>
  `,
    monday,
    "cahier"
  );
  expect(days.flatMap(day => day.courses)).toEqual([
    expect.objectContaining({
      id: "cahier-de-prepa:13",
      subject: "Mathématiques",
      from: new Date(2026, 10, 16, 8),
      to: new Date(2026, 10, 16, 9, 30),
      createdByAccount: "cahier",
    }),
  ]);
});
