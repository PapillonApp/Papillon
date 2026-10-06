/// <reference types="jest" />
import {
  mapAgenda,
  mapRecentItem,
  mapRecentItemToHomework,
  mapRecentItemsToHomeworks,
  normalizeCahierDePrepaUrl,
} from "@/services/cahierDePrepa/mapping";
import { CourseType } from "@/services/shared/timetable";

describe("Cahier de Prépa mappings", () => {
  it("normalizes instance URLs without credentials or query state", () => {
    expect(
      normalizeCahierDePrepaUrl("https://example.test/mp2i?secret=never-log")
    ).toBe("https://example.test/mp2i/");
  });

  it("maps recent content to source-prefixed news", () => {
    const news = mapRecentItem(
      {
        title: "Exam",
        href: "/recent?id=1",
        text: "Details",
        date: "2026-09-12",
      },
      "account",
      0
    );
    expect(news.id).toBe("cahier-de-prepa:/recent?id=1");
    expect(news.createdByAccount).toBe("account");
    expect(news.acknowledged).toBe(false);
  });

  it("maps recent homework and keeps it in the requested week", () => {
    const item = {
      title: "Maths — DM à rendre le 15/09/2026",
      href: "/recent?id=2",
      text: "Exercices à faire.",
      date: "2026-09-10",
    };
    const homework = mapRecentItemToHomework(item, "account", 0);
    expect(homework?.dueDate.getFullYear()).toBe(2026);
    expect(homework?.dueDate.getMonth()).toBe(8);
    expect(homework?.dueDate.getDate()).toBe(15);
    expect(homework?.createdByAccount).toBe("account");
    expect(mapRecentItemsToHomeworks([item], "account", 38)).toHaveLength(1);
    expect(mapRecentItemsToHomeworks([item], "account", 39)).toHaveLength(0);
  });
  it("only maps agenda entries with a parseable date and time range", () => {
    const days = mapAgenda(
      [
        {
          title: "Oral",
          date: "12/09/2026",
          time: "08:00 - 10:00",
          location: "Room",
          text: "Details",
        },
        { title: "All day", date: "12/09/2026", text: "Details" },
        {
          title: "Invalid",
          date: "not-a-date",
          time: "08:00 - 09:00",
          text: "Details",
        },
      ],
      "account"
    );
    expect(days).toHaveLength(1);
    expect(days[0].courses[0].type).toBe(CourseType.ACTIVITY);
    expect(days[0].courses[0].createdByAccount).toBe("account");
  });
});
