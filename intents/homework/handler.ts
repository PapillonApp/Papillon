import { getWeekNumberFromDate } from "@/database/useHomework";
import { getSubjectName } from "@/utils/subjects/name";
import { IntentHandler, registerHandler } from "papillon-intents";
import { error } from "@/utils/logger/logger";
import {
  initManager,
  isSameDay,
  parseDate,
  stripHtml,
} from "@/intents/helpers";

async function fetchHomeworkForDate(date: Date) {
  const manager = await initManager();
  if (!manager) return null;

  const weekNumber = getWeekNumberFromDate(date);
  const homeworks = await manager.getHomeworks(weekNumber);
  const filtered = homeworks.filter(hw => isSameDay(hw.dueDate, date));
  if (filtered.length === 0) return null;

  return filtered.map(hw => ({
    id: hw.id,
    subject: getSubjectName(hw.subject),
    content: stripHtml(hw.content),
    dueDate: hw.dueDate,
    isDone: hw.isDone,
    evaluation: hw.evaluation,
  }));
}

const getTodayHomework: IntentHandler = async () => {
  try {
    return await fetchHomeworkForDate(new Date());
  } catch (err) {
    error(`Error in getTodayHomework: ${err}`);
    return null;
  }
};

const getHomeworkForDate: IntentHandler = async params => {
  try {
    return await fetchHomeworkForDate(parseDate(params.date));
  } catch (err) {
    error(`Error in getHomeworkForDate: ${err}`);
    return null;
  }
};

registerHandler("homework.getToday", getTodayHomework);
registerHandler("homework.getForDate", getHomeworkForDate);
