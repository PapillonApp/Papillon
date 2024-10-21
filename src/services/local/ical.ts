import { Account } from "@/stores/account/types";
import { Timetable } from "../shared/Timetable";
import { useTimetableStore } from "@/stores/timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { reduceIcalToCourse } from "./utils/reduceIcalToCourse";
import {error} from "@/utils/logger/logger";
const icalParser = require("cal-parser");

const MERGE_THRESHOLD = 20 * 60 * 1000; // 20 minutes in milliseconds

interface CoursesByEpochWeekNumber {
  epochWeekNumber: number
  courses: Timetable
}

export const fetchIcalData = async (account: Account, force = false): Promise<CoursesByEpochWeekNumber[]> => {
  if (account.isExternal) {
    error(`Cannot fetch iCals for account type ${account.service}`, "fetchIcalData");
    return [];
  }
  const identityProvider = account.identityProvider || "";
  const courses: Timetable = [];

  const icalURLs = account.personalization.icalURLs || [];

  for (const ical of icalURLs) {
    await fetch(ical.url).then(res => res.text()).then(text => {
      const parsed = icalParser.parseString(text).events;
      for (const event of parsed) {
        courses.push(reduceIcalToCourse(event, identityProvider, ical.url));
      }
    });
  }

  const coursesByEpochWeekNumber: CoursesByEpochWeekNumber[] = courses.reduce((acc: CoursesByEpochWeekNumber[], course) => {
    const epochWeekNumber = dateToEpochWeekNumber(new Date(course.startTimestamp));
    const item = acc.find((c) => c.epochWeekNumber === epochWeekNumber);
    if (item) {
      item.courses.push(course);
    }
    else {
      acc.push({ epochWeekNumber, courses: [course] });
    }
    return acc;
  }, []);

  // merge courses with same subject, room, title and itemType, and less than 20 minutes between them
  for (const { courses } of coursesByEpochWeekNumber) {
    courses.sort((a, b) => a.startTimestamp - b.startTimestamp);

    const mergedCourses: Timetable = courses.reduce((acc: Timetable, course) => {
      const lastCourse = acc[acc.length - 1];
      if (lastCourse &&
          lastCourse.subject === course.subject &&
          lastCourse.room === course.room &&
          lastCourse.title === course.title &&
          lastCourse.itemType === course.itemType &&
          course.startTimestamp - lastCourse.endTimestamp <= MERGE_THRESHOLD) {
        lastCourse.endTimestamp = Math.max(lastCourse.endTimestamp, course.endTimestamp);
      } else {
        acc.push(course);
      }
      return acc;
    }, []);

    courses.splice(0, courses.length, ...mergedCourses);
  }

  // for each week, sort by startTimestamp
  for (const { courses } of coursesByEpochWeekNumber) {
    courses.sort((a, b) => a.startTimestamp - b.startTimestamp);
  }

  for (const { epochWeekNumber, courses } of coursesByEpochWeekNumber) {
    useTimetableStore.getState().updateClasses(epochWeekNumber, courses);
  }

  return coursesByEpochWeekNumber;
};
