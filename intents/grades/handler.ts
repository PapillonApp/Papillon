import { IntentHandler, registerHandler } from "papillon-intents";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import { getSubjectName } from "@/utils/subjects/name";
import { error } from "@/utils/logger/logger";
import { initManager } from "@/intents/helpers";

const getLatestGrades: IntentHandler = async () => {
  try {
    const manager = await initManager();
    if (!manager) return null;

    const periods = await manager.getGradesPeriods();
    const currentPeriod = getCurrentPeriod(periods);
    if (!currentPeriod) return null;

    const result = await manager.getGradesForPeriod(
      currentPeriod,
      currentPeriod.createdByAccount
    );

    const grades = result.subjects
      .flatMap(subject => subject.grades)
      .filter(
        (grade): grade is NonNullable<typeof grade> =>
          grade != null &&
          grade.studentScore?.value !== undefined &&
          !!grade.givenAt &&
          !isNaN(grade.studentScore.value) &&
          !grade.studentScore.disabled
      );

    if (grades.length === 0) return null;

    return grades.map(grade => ({
      id: grade.id,
      subject: getSubjectName(grade.subjectName),
      title: grade.description,
      value: grade.studentScore!.value,
      scale: grade.studentScore!.outOf,
      average: grade.averageScore?.value,
      date: grade.givenAt,
    }));
  } catch (err) {
    error(`Error in getLatestGrades: ${err}`);
    return null;
  }
};

registerHandler("grades.getLatest", getLatestGrades);