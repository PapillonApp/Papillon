import { updateTimetableForWeekInCache } from "@/services/timetable";
import { useTimetableStore } from "@/stores/timetable";
import { papillonNotify } from "../Notifications";
import { TimetableClass, TimetableClassStatus } from "@/services/shared/Timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { PrimaryAccount } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import { getSubjectData } from "@/services/shared/Subject";

/**
 * Compare deux listes de cours et renvoie une liste de changements
 * @param oldClasses Les cours avant la mise à jour
 * @param newClasses Les cours après la mise à jour
 * @returns Liste des changements détectés
 */
const detectChanges = (oldClasses: TimetableClass[], newClasses: TimetableClass[]): any[] => {
  const changes = [];
  const oldMap = new Map(oldClasses.map((lesson) => [lesson.id, lesson]));
  const newMap = new Map(newClasses.map((lesson) => [lesson.id, lesson]));

  // Vérifier les ajouts et modifications
  for (const [id, newLesson] of newMap) {
    if (!oldMap.has(id)) {
      changes.push({ title: "Nouveau cours", body: `${newLesson.subject ? getSubjectData(newLesson.subject).pretty : "Un cours"} ${newLesson.teacher ? `avec ${newLesson.teacher}` : ""} de ${new Date(newLesson.startTimestamp).toLocaleTimeString("fr-FR", {hour: "2-digit", minute: "2-digit", hour12: false})} à ${new Date(newLesson.endTimestamp).toLocaleTimeString("fr-FR", {hour: "2-digit", minute: "2-digit", hour12: false})} ${newLesson.room ?? `en salle ${newLesson.room}`}` });
    } else {
      const oldLesson = oldMap.get(id)!;
      if (oldLesson.startTimestamp !== newLesson.startTimestamp || oldLesson.room !== newLesson.room) {
        changes.push({ title: "Modification de cours", body: `Le cours de ${getSubjectData(newLesson.subject).pretty} à été déplacé ${oldLesson.startTimestamp !== newLesson.startTimestamp ? `à ${new Date(newLesson.startTimestamp).toLocaleTimeString("fr-FR", {hour: "2-digit", minute: "2-digit", hour12: false})}}` : ""} ${oldLesson.room !== newLesson.room ? `en salle ${newLesson.room}` : ""}`});
      } else if (oldLesson.status !== newLesson.status && newLesson.status === TimetableClassStatus.CANCELED) {
        changes.push({ title: "Cours annulé", body: `Le cours de ${getSubjectData(newLesson.subject).pretty} débutant à ${new Date(newLesson.startTimestamp).toLocaleTimeString("fr-FR", {hour: "2-digit", minute: "2-digit", hour12: false})} et finissant à ${new Date(newLesson.endTimestamp).toLocaleTimeString("fr-FR", {hour: "2-digit", minute: "2-digit", hour12: false})} est annulé`});
      } else if (oldLesson.teacher !== newLesson.teacher) {
        changes.push({ title: "Changement de profeseur", body: `Le cours de ${getSubjectData(newLesson.subject).pretty} avec ${oldLesson.teacher} à été remplacé par ${newLesson.teacher}`});
      }
    }
  }

  return changes;
};

/**
 * Fetch the lessons for the account and notify the user if there are new informations
 * @param account The account to fetch the lessons
 * @returns The updated lessons
 */
const fetchLessons = async (account: PrimaryAccount): Promise<TimetableClass[]> => {
  const notificationsTypesPermissions = account.personalization.notifications;
  const currentWeekNumber = dateToEpochWeekNumber(new Date());
  const today = new Date().toDateString(); // Get the current date

  // Get the current timetable
  const currentTimetable = await useTimetableStore.getState().timetables;
  const oldLessons = currentTimetable[currentWeekNumber]?.filter(
    (lesson) => new Date(lesson.startTimestamp).toDateString() === today
  ) || [];

  // Update the timetable
  await updateTimetableForWeekInCache(account, currentWeekNumber);

  // Get the updated timetable
  const updatedTimetable = await useTimetableStore.getState().timetables;
  const newLessons = updatedTimetable[currentWeekNumber]?.filter(
    (lesson) => new Date(lesson.startTimestamp).toDateString() === today
  ) || [];

  // Detect changes
  const changes = detectChanges(oldLessons, newLessons);

  // Notify the user if there are new informations
  if (notificationsTypesPermissions?.enabled && notificationsTypesPermissions?.timetable) {
    for (const change of changes) {
      papillonNotify({id: `${account.localID}-${uuid()}-timetable`, title: `[${account.name}] ${change.title}`, body: change.body, ios: { categoryId: account.localID } });
    }
  }

  console.log(changes);

  return newLessons.map((lesson) => {
    return {
      localID: account.localID,
      color: getSubjectData(lesson.subject).color,
      ...lesson,
      subject: getSubjectData(lesson.subject).pretty,
    };
  });
};

export { fetchLessons };
