import { useCallback, useMemo } from "react";

import { Grade, Subject } from "@/services/shared/grade";
import { getSubjectAverageByProperty as getSubjectAverageByPropertyHelper } from "@/utils/grades/algorithms/helpers";
import { getSubjectAverage } from "@/utils/grades/algorithms/subject";

function computeGlobalAverage(averages: Record<string, number>): number {
  let total = 0;
  let count = 0;
  Object.values(averages).forEach(avg => {
    if (avg !== -1) {
      total += avg;
      count++;
    }
  });
  return count > 0 ? total / count : 0;
}

function computeGradeInfluence(
  grade: Grade,
  subjectAverages: Record<string, number>,
  globalAverage: number,
  getSubjectById: (id: string) => Subject | undefined,
  calculateSubjectAverage: (grades: Grade[]) => number
): number {
  const subjectId = grade.subjectId;
  const currentSubjectAvg = subjectAverages[subjectId];

  if (currentSubjectAvg === undefined || currentSubjectAvg === -1) {
    return 0;
  }

  const subject = getSubjectById(subjectId);
  if (!subject) {
    return 0;
  }

  const remainingGrades = (subject.grades ?? []).filter(g => g.id !== grade.id);
  const newSubjectAvg = calculateSubjectAverage(remainingGrades);

  let total = 0;
  let count = 0;
  Object.entries(subjectAverages).forEach(([id, avg]) => {
    if (id !== subjectId && avg !== -1) {
      total += avg;
      count++;
    }
  });

  if (newSubjectAvg === -1) {
    if (count === 0) {
      return 0;
    }
  } else {
    total += newSubjectAvg;
    count++;
  }

  const newGlobalAverage = count > 0 ? total / count : 0;
  return Number((globalAverage - newGlobalAverage).toFixed(2));
}

export const useGradeInfluence = (
  subjects: Subject[],
  getSubjectById: (id: string) => Subject | undefined
) => {
  // Pre-calculate subject averages to avoid re-computing them for every grade.
  const subjectAverages = useMemo(() => {
    const avgs: Record<string, number> = {};
    subjects.forEach(subject => {
      avgs[subject.id] = getSubjectAverage(subject.grades ?? []);
    });
    return avgs;
  }, [subjects]);

  const subjectClassAverages = useMemo(() => {
    const avgs: Record<string, number> = {};
    subjects.forEach(subject => {
      avgs[subject.id] = getSubjectAverageByPropertyHelper(
        subject.grades ?? [],
        "averageScore"
      );
    });
    return avgs;
  }, [subjects]);

  const globalAverage = useMemo(
    () => computeGlobalAverage(subjectAverages),
    [subjectAverages]
  );

  const globalClassAverage = useMemo(
    () => computeGlobalAverage(subjectClassAverages),
    [subjectClassAverages]
  );

  const getAvgInfluence = useCallback(
    (grade: Grade) =>
      computeGradeInfluence(
        grade,
        subjectAverages,
        globalAverage,
        getSubjectById,
        getSubjectAverage
      ),
    [subjectAverages, globalAverage, getSubjectById]
  );

  const getAvgClassInfluence = useCallback(
    (grade: Grade) =>
      computeGradeInfluence(
        grade,
        subjectClassAverages,
        globalClassAverage,
        getSubjectById,
        grades => getSubjectAverageByPropertyHelper(grades, "averageScore")
      ),
    [subjectClassAverages, globalClassAverage, getSubjectById]
  );

  return {
    getAvgInfluence,
    getAvgClassInfluence,
  };
};
