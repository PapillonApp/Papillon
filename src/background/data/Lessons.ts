import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import { getLessons, updateLessonsState } from "../utils/lessons";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { Timetable, TimetableClassStatus } from "@/services/shared/Timetable";
import { log } from "@/utils/logger/logger";

const getAllLessonsForDay = (lessons: Record<number, Timetable>) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const week = dateToEpochWeekNumber(date);
  const timetable = lessons[week] || [];

  const day = timetable.filter((lesson) => {
    const lessonDate = new Date(lesson.startTimestamp);
    lessonDate.setHours(0, 0, 0, 0);

    return lessonDate.getTime() === date.getTime();
  });

  return day;
};

const fetchLessons = async (): Promise<Timetable> => {
  log("Running background Lessons", "BackgroundEvent");
  const account = getCurrentAccount();
  const notificationsTypesPermissions = account.personalization.notifications;

  const weekNumber = dateToEpochWeekNumber(new Date());
  await updateLessonsState(account, weekNumber);
  const updatedLessons = getLessons();
  const lessonsDay = getAllLessonsForDay(updatedLessons);
  const lessonsEvent = lessonsDay.filter((element) => element.statusText);

  // Notifie 15 minutes avant le début du 1er cours
  // De base, je voulais faire 1 heure avant, mais la notif sera modifiée à chaque fois
  // comme la fréquence du background est de 15 minutes
  const now = new Date().getTime();
  const oneHourBefore = lessonsDay[0]?.startTimestamp - 15 * 60 * 1000;

  if (
    notificationsTypesPermissions?.enabled &&
    notificationsTypesPermissions?.timetable &&
    now >= oneHourBefore &&
    now < lessonsDay[0]?.startTimestamp
  ) {
    switch (lessonsEvent.length) {
      case 0:
        break;
      case 1:
        const dateLessonsDebut = `${new Date(lessonsEvent[0].startTimestamp)
          .getHours()
          .toString()
          .padStart(2, "0")}:${new Date(lessonsEvent[0].startTimestamp)
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        const dateLessonsFin = `${new Date(lessonsEvent[0].endTimestamp)
          .getHours()
          .toString()
          .padStart(2, "0")}:${new Date(lessonsEvent[0].endTimestamp)
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        let statut: string = "";

        switch (lessonsEvent[0].status) {
          case TimetableClassStatus.CANCELED:
            statut = "a été annulé";
            break;
          case TimetableClassStatus.TEST:
            statut = "est un devoir surveillé";
          case TimetableClassStatus.MODIFIED:
            statut =
              "est un cours modifié, consulte l'emploi du temps pour plus de détails";
          default:
            if (lessonsEvent[0].statusText === "Changement de salle") {
              statut = "a un changement de salle ! ";
              if (lessonsEvent[0].room) {
                if (lessonsEvent[0].room.includes(",")) {
                  statut +=
                    "Consulte l'emploi du temps pour regarder les salles de cours";
                } else {
                  statut += `Tu dois aller en salle ${lessonsEvent[0].room}`;
                }
              }
            } else if (lessonsEvent[0].statusText === "Devoir Surveillé") {
              statut = "est un devoir surveillé";
            } else {
              statut = `a un statut : ${lessonsEvent[0].statusText}`;
            }
            break;
        }

        papillonNotify(
          {
            id: `${account.name}-lessons`,
            title: `[${account.name}] Emploi du temps du jour modifié`,
            subtitle: new Date(
              lessonsEvent[0].startTimestamp
            ).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }),
            body: `Le cours de ${lessonsEvent[0].title} (${dateLessonsDebut}-${dateLessonsFin}) ${statut}`,
            ios: {
              categoryId: account.name,
            },
          },
          "Lessons"
        );
        break;
      default:
        papillonNotify(
          {
            id: `${account.name}-lessons`,
            title: `[${account.name}] Emploi du temps du jour`,
            subtitle: new Date(
              lessonsEvent[0].startTimestamp
            ).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }),
            body: `Les cours suivants ont été modifiés, consulte l'emploi du temps pour plus de détails.<br />
            ${lessonsEvent
              .flatMap((element) => {
                return `- ${element.title}`;
              })
              .join("<br />")}`,
            ios: {
              categoryId: account.name,
            },
          },
          "Lessons"
        );
        break;
    }
  }

  return lessonsEvent;
};

export { fetchLessons };
