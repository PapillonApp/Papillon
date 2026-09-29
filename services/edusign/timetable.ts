import { LinksignClient } from "@studentsphere/linksign";
import { t } from "i18next";
import { getDateRangeOfWeek } from "@/database/useHomework";
import {
  Course,
  CourseDay,
  CourseStatus,
  CourseType,
} from "../shared/timetable";
import { error } from "@/utils/logger/logger";

export async function fetchEdusignTimetable(
  client: LinksignClient,
  accountId: string,
  weekNumber: number
): Promise<CourseDay[]> {
  try {
    const { start, end } = getDateRangeOfWeek(weekNumber);
    const courses = await client.getCoursesBetweenDates(
      start.toISOString(),
      end.toISOString()
    );
    const professorIds = new Set<string>();
    courses.forEach(course => {
      if (course.PROFESSOR) {
        course.PROFESSOR.split(",").forEach(id => professorIds.add(id.trim()));
      }
    });
    const professorMap = new Map<string, string>();
    if (professorIds.size > 0) {
      try {
        const professors = await client.getProfessors(Array.from(professorIds));
        professors.forEach(prof => {
          professorMap.set(prof.ID, `${prof.FIRSTNAME} ${prof.LASTNAME}`);
        });
      } catch (e) {
        error("Failed to fetch professors", "Edusign.fetchEdusignTimetable");
      }
    }

    const groupedByDay: Record<string, Course[]> = {};

    for (const course of courses) {
      if (course.data_type !== "attendance_sheet") continue;

      const courseDate = new Date(course.START);
      const dateKey = courseDate.toISOString().split("T")[0];

      if (!groupedByDay[dateKey]) {
        groupedByDay[dateKey] = [];
      }

      const teacherName = course.PROFESSOR
        ? course.PROFESSOR.split(",")
            .map(id => professorMap.get(id.trim()))
            .filter(Boolean)
            .join(", ")
        : undefined;

      const isSigned = Boolean(course.STUDENT_SIGNATURE);
      const isStudentPresent = Boolean(
        course.STUDENT_PRESENCE || course.STUDENT_SIGNATURE
      );
      const isAbsent = Boolean(course.STUDENT_ABSENCE_ID);
      const canSign =
        !isSigned &&
        !course.STUDENT_PRESENCE &&
        !course.EXCLUDED &&
        course.NEED_STUDENTS_SIGNATURE !== 0;

      groupedByDay[dateKey].push({
        id: course.ID || course.API_ID || Math.random().toString(),
        externalId: course.ID || course.API_ID,
        subject: course.NAME,
        type: CourseType.LESSON,
        from: courseDate,
        to: new Date(course.END),
        room: course.CLASSROOM,
        teacher: teacherName,
        backgroundColor: "#000000",
        status: course.EXCLUDED ? CourseStatus.CANCELED : undefined,
        createdByAccount: accountId,
        customStatus: isStudentPresent
          ? t("Present_Course")
          : isAbsent
            ? t("Absent_Course")
            : undefined,
        isSigned,
        isStudentPresent,
        canSign,
      });
    }

    const result: CourseDay[] = Object.keys(groupedByDay).map(dateStr => ({
      date: new Date(dateStr),
      courses: groupedByDay[dateStr].sort(
        (a, b) => a.from.getTime() - b.from.getTime()
      ),
    }));

    return result;
  } catch (err) {
    error("Failed to fetch Edusign timetable", "Edusign.fetchEdusignTimetable");
    throw err;
  }
}
