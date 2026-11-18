import { describe, expect, it } from "@jest/globals";

import { parseICalString } from "./ical-event-parser";

const VTIMEZONE_PARIS = [
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Paris",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
].join("\r\n");

describe("parseICalString recurring events", () => {
  it("expands weekly RRULE occurrences within the requested range", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Papillon//Test//FR",
      VTIMEZONE_PARIS,
      "BEGIN:VEVENT",
      "UID:weekly-course@test",
      "DTSTART;TZID=Europe/Paris:20260907T090000",
      "DTEND;TZID=Europe/Paris:20260907T110000",
      "RRULE:FREQ=WEEKLY",
      "SUMMARY:Algorithmique",
      "LOCATION:Amphi A",
      "DESCRIPTION:CM hebdomadaire",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const rangeStart = new Date("2026-09-14T00:00:00.000Z");
    const rangeEnd = new Date("2026-09-28T23:59:59.999Z");

    const { events } = parseICalString(ics, rangeStart, rangeEnd);

    expect(events).toHaveLength(3);
    expect(events.map(event => event.dtstart?.toISOString())).toEqual([
      "2026-09-14T07:00:00.000Z",
      "2026-09-21T07:00:00.000Z",
      "2026-09-28T07:00:00.000Z",
    ]);
    expect(events.map(event => event.uid)).toEqual([
      `weekly-course@test::${new Date("2026-09-14T07:00:00.000Z").getTime()}`,
      `weekly-course@test::${new Date("2026-09-21T07:00:00.000Z").getTime()}`,
      `weekly-course@test::${new Date("2026-09-28T07:00:00.000Z").getTime()}`,
    ]);
    expect(events[0].summary).toBe("Algorithmique");
    expect(events[0].location).toBe("Amphi A");
    expect(events[0].description).toBe("CM hebdomadaire");
  });

  it("skips occurrences excluded by EXDATE", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Papillon//Test//FR",
      VTIMEZONE_PARIS,
      "BEGIN:VEVENT",
      "UID:exdate-course@test",
      "DTSTART;TZID=Europe/Paris:20260907T140000",
      "DTEND;TZID=Europe/Paris:20260907T160000",
      "RRULE:FREQ=WEEKLY;COUNT=4",
      "EXDATE;TZID=Europe/Paris:20260914T140000",
      "SUMMARY:Reseaux",
      "LOCATION:Salle C12",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const rangeStart = new Date("2026-09-01T00:00:00.000Z");
    const rangeEnd = new Date("2026-09-30T23:59:59.999Z");

    const { events } = parseICalString(ics, rangeStart, rangeEnd);

    expect(events).toHaveLength(3);
    expect(events.map(event => event.dtstart?.toISOString())).toEqual([
      "2026-09-07T12:00:00.000Z",
      "2026-09-21T12:00:00.000Z",
      "2026-09-28T12:00:00.000Z",
    ]);
  });

  it("applies modified RECURRENCE-ID exception details without leaking across UIDs", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Papillon//Test//FR",
      VTIMEZONE_PARIS,
      "BEGIN:VEVENT",
      "UID:physics-course@test",
      "DTSTART;TZID=Europe/Paris:20260907T080000",
      "DTEND;TZID=Europe/Paris:20260907T100000",
      "RRULE:FREQ=WEEKLY;COUNT=3",
      "SUMMARY:Physique",
      "LOCATION:Salle P1",
      "DESCRIPTION:Cours normal",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "UID:physics-course@test",
      "RECURRENCE-ID;TZID=Europe/Paris:20260914T080000",
      "DTSTART;TZID=Europe/Paris:20260914T100000",
      "DTEND;TZID=Europe/Paris:20260914T120000",
      "SUMMARY:Physique (TP deplace)",
      "LOCATION:Labo L3",
      "DESCRIPTION:Groupe B uniquement",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "UID:other-course@test",
      "DTSTART;TZID=Europe/Paris:20260907T080000",
      "DTEND;TZID=Europe/Paris:20260907T090000",
      "RRULE:FREQ=WEEKLY;COUNT=2",
      "SUMMARY:Anglais",
      "LOCATION:Salle E2",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const rangeStart = new Date("2026-09-01T00:00:00.000Z");
    const rangeEnd = new Date("2026-09-30T23:59:59.999Z");

    const { events } = parseICalString(ics, rangeStart, rangeEnd);

    const physicsEvents = events.filter(event =>
      event.uid.startsWith("physics-course@test::")
    );
    const otherEvents = events.filter(event =>
      event.uid.startsWith("other-course@test::")
    );

    expect(physicsEvents).toHaveLength(3);
    expect(physicsEvents[1]).toMatchObject({
      summary: "Physique (TP deplace)",
      location: "Labo L3",
      description: "Groupe B uniquement",
      dtstart: new Date("2026-09-14T08:00:00.000Z"),
      dtend: new Date("2026-09-14T10:00:00.000Z"),
    });
    expect(physicsEvents[2]).toMatchObject({
      summary: "Physique",
      location: "Salle P1",
      description: "Cours normal",
    });

    expect(otherEvents).toHaveLength(2);
    expect(otherEvents[1]).toMatchObject({
      summary: "Anglais",
      location: "Salle E2",
      dtstart: new Date("2026-09-14T06:00:00.000Z"),
    });
  });

  it("returns the master event when no range is provided", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Papillon//Test//FR",
      "BEGIN:VEVENT",
      "UID:master-only@test",
      "DTSTART:20260907T080000Z",
      "DTEND:20260907T100000Z",
      "RRULE:FREQ=WEEKLY",
      "SUMMARY:Histoire",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const { events } = parseICalString(ics);

    expect(events).toHaveLength(1);
    expect(events[0].uid).toBe("master-only@test");
  });
});
