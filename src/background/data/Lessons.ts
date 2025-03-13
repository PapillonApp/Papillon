import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import { getLessons, updateLessonsState } from "../utils/lessons";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import {
  Timetable,
  TimetableClass,
  TimetableClassStatus,
} from "@/services/shared/Timetable";
import { formatHoursMinutes } from "../utils/format";

const getAllLessonsForDay = (lessons: Record<number, Timetable>) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const week = dateToEpochWeekNumber(date);
  const timetable = lessons[week] || [];

  const lessonsOfDay = timetable.filter((lesson) => {
    const lessonDate = new Date(lesson.startTimestamp);
    lessonDate.setHours(0, 0, 0, 0);

    return lessonDate.getTime() === date.getTime();
  });

  return lessonsOfDay;
};

const getDifferences = (
  currentLessons: TimetableClass[],
  updatedLessons: TimetableClass[],
  compareFn: (a: TimetableClass, b: TimetableClass) => boolean
): TimetableClass[] => {
  return updatedLessons.filter(
    (updatedItem) =>
      !currentLessons.some((item) => compareFn(item, updatedItem))
  );
};

const fetchLessons = async (): Promise<Timetable> => {
  const account = getCurrentAccount();
  const notificationsTypesPermissions = account.personalization.notifications;

  const currentLessons = getLessons();
  if (!notificationsTypesPermissions?.timetable) {
    return getAllLessonsForDay(currentLessons);
  }

  if (__DEV__) {
    await papillonNotify(
      {
        id: "statusBackground",
        title: account.name,
        body: "Récupération de l'emploi du temps...",
        android: {
          progress: {
            max: 100,
            current: (100 / 6) * 4,
            indeterminate: false,
          },
        },
      },
      "Status"
    );
  }

  const weekNumber = dateToEpochWeekNumber(new Date());
  await updateLessonsState(account, weekNumber);
  const updatedLessons = getLessons();

  if (
    getAllLessonsForDay(currentLessons).length === 0 &&
    getAllLessonsForDay(currentLessons).length !== 0
  ) {
    return getAllLessonsForDay(updatedLessons);
  }

  const differencesStatus = getDifferences(
    getAllLessonsForDay(currentLessons) ?? [],
    getAllLessonsForDay(updatedLessons) ?? [],
    (a, b) => a.status === b.status && a.statusText === b.statusText
  );
  const differencesTimestamp = getDifferences(
    getAllLessonsForDay(currentLessons) ?? [],
    getAllLessonsForDay(updatedLessons) ?? [],
    (a, b) =>
      a.startTimestamp === b.startTimestamp && a.endTimestamp === b.endTimestamp
  );
  const totalDifference =
    differencesStatus.length + differencesTimestamp.length;

  switch (totalDifference) {
    case 0:
      break;
    case 1:
      if (differencesTimestamp.length === 1) {
        const dateLessonsDebut = formatHoursMinutes(
          differencesTimestamp[0].startTimestamp
        );
        const dateLessonsFin = formatHoursMinutes(
          differencesTimestamp[0].endTimestamp
        );

        await papillonNotify(
          {
            id: `${account.name}-lessons`,
            title: `[${account.name}] Changement de cours`,
            subtitle: new Date(
              differencesTimestamp[0].startTimestamp
            ).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }),
            body: `${differencesStatus[0].subject} (${dateLessonsDebut}-${dateLessonsFin}) : Horaire du cours modifié`,
            data: {
              accountID: account.localID,
              page: "Lessons"
            }
          },
          "Lessons"
        );
      } else {
        const dateLessonsDebut = formatHoursMinutes(
          differencesStatus[0].startTimestamp
        );
        const dateLessonsFin = formatHoursMinutes(
          differencesStatus[0].endTimestamp
        );

        let statut: string = "";

        switch (differencesTimestamp[0].status) {
          case TimetableClassStatus.TEST:
            statut = "Devoir surveillé";
            break;
          case TimetableClassStatus.MODIFIED:
            statut = "Cours modifié, ouvrir pour plus de détails";
            break;
          default:
            if (differencesStatus[0].statusText === "Changement de salle") {
              statut = "Changement de salle";
              if (differencesStatus[0].room) {
                if (differencesStatus[0].room.includes(",")) {
                  statut += ", ouvrir pour plus de détails";
                } else {
                  statut += ` ➡️ ${differencesStatus[0].room}`;
                }
              }
            } else if (differencesStatus[0].statusText === "Devoir Surveillé") {
              statut = "Devoir surveillé";
            } else {
              statut = differencesStatus[0].statusText ?? "";
            }
            break;
        }

        await papillonNotify(
          {
            id: `${account.name}-lessons`,
            title: `[${account.name}] Changement de cours`,
            subtitle: new Date(
              differencesStatus[0].startTimestamp
            ).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }),
            body: `${differencesStatus[0].subject} (${dateLessonsDebut}-${dateLessonsFin}) : ${statut}`,
            data: {
              accountID: account.localID,
              page: "Lessons"
            }
          },
          "Lessons"
        );
      }
      break;
    default:
      const lessonsCounts: Record<string, number> = {};

      [...differencesStatus, ...differencesTimestamp].forEach((hw) => {
        lessonsCounts[hw.title] = (lessonsCounts[hw.title] || 0) + 1;
      });

      const lessonsPreview = Object.entries(lessonsCounts)
        .map(([subject, count]) =>
          count > 1 ? `${count}x ${subject}` : subject
        )
        .join(", ");

      await papillonNotify(
        {
          id: `${account.name}-lessons`,
          title: `[${account.name}] Changement de cours`,
          subtitle: new Date(
            differencesStatus[0].startTimestamp
          ).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }),
          body: `${totalDifference} cours modifiés :<br />
            ${lessonsPreview}`,
          data: {
            accountID: account.localID,
            page: "Lessons"
          }
        },
        "Lessons"
      );
      break;
  }
  return differencesStatus ?? differencesTimestamp;
};

export { fetchLessons };
