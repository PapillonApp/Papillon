import { useMemo, useCallback } from 'react';
import { Grade, Subject } from "@/services/shared/grade";

import { getSubjectAverageByProperty as getSubjectAverageByPropertyHelper } from "@/utils/grades/algorithms/helpers";
import { getSubjectAverage } from "@/utils/grades/algorithms/subject";

export const useGradeInfluence = (subjects: Subject[], getSubjectById: (id: string) => Subject | undefined) => {
  // Pre-calculate subject averages to avoid re-computing them for every grade
  const subjectAverages = useMemo(() => {
    const avgs: Record<string, number> = {};
    subjects.forEach(subject => {
      avgs[subject.id] = getSubjectAverage(subject.grades);
    });
    return avgs;
  }, [subjects]);

  const subjectClassAverages = useMemo(() => {
    const avgs: Record<string, number> = {};
    subjects.forEach(subject => {
      avgs[subject.id] = getSubjectAverageByPropertyHelper(subject.grades, "averageScore");
    });
    return avgs;
  }, [subjects]);

  const globalAverage = useMemo(() => {
    let total = 0;
    let count = 0;
    Object.values(subjectAverages).forEach(avg => {
      if (avg !== -1) {
        total += avg;
        count++;
      }
    });
    return count > 0 ? total / count : 0;
  }, [subjectAverages]);

  const globalClassAverage = useMemo(() => {
    let total = 0;
    let count = 0;
    Object.values(subjectClassAverages).forEach(avg => {
      if (avg !== -1) {
        total += avg;
        count++;
      }
    });
    return count > 0 ? total / count : 0;
  }, [subjectClassAverages]);

  const getAvgInfluence = useCallback((grade: Grade) => {
    const subjectId = grade.subjectId;
    const currentSubjectAvg = subjectAverages[subjectId];

    if (currentSubjectAvg === undefined || currentSubjectAvg === -1) return 0;

    // Calculate what the subject average would be without this grade
    // We need to find the subject and filter the grade out
    const subject = getSubjectById(subjectId);
    if (!subject) return 0;

    const newSubjectAvg = getSubjectAverage(subject.grades.filter(g => g.id !== grade.id));

    // If the subject average doesn't change (or becomes invalid), the influence is 0 (or based on removing the subject)
    // But wait, if the subject average becomes -1 (invalid), it means the subject no longer counts towards the global average.
    
    let newGlobalAverage = 0;
    
    if (newSubjectAvg === -1) {
      // Subject is removed from global average
      let total = 0;
      let count = 0;
      Object.entries(subjectAverages).forEach(([id, avg]) => {
        if (id !== subjectId && avg !== -1) {
          total += avg;
          count++;
        }
      });
      newGlobalAverage = count > 0 ? total / count : 0;
    } else {
      // Subject average changes
      let total = 0;
      let count = 0;
      Object.entries(subjectAverages).forEach(([id, avg]) => {
        if (id !== subjectId && avg !== -1) {
          total += avg;
          count++;
        }
      });
      // Add the new subject average
      total += newSubjectAvg;
      count++;
      newGlobalAverage = count > 0 ? total / count : 0;
    }

    return Number((globalAverage - newGlobalAverage).toFixed(2));
  }, [subjectAverages, globalAverage, getSubjectById]);

  const getAvgClassInfluence = useCallback((grade: Grade) => {
    const subjectId = grade.subjectId;
    const currentSubjectAvg = subjectClassAverages[subjectId];

    if (currentSubjectAvg === undefined || currentSubjectAvg === -1) return 0;

    const subject = getSubjectById(subjectId);
    if (!subject) return 0;

    const newSubjectAvg = getSubjectAverageByPropertyHelper(subject.grades.filter(g => g.id !== grade.id), "averageScore");

    let newGlobalAverage = 0;

    if (newSubjectAvg === -1) {
      let total = 0;
      let count = 0;
      Object.entries(subjectClassAverages).forEach(([id, avg]) => {
        if (id !== subjectId && avg !== -1) {
          total += avg;
          count++;
        }
      });
      newGlobalAverage = count > 0 ? total / count : 0;
    } else {
      let total = 0;
      let count = 0;
      Object.entries(subjectClassAverages).forEach(([id, avg]) => {
        if (id !== subjectId && avg !== -1) {
          total += avg;
          count++;
        }
      });
      total += newSubjectAvg;
      count++;
      newGlobalAverage = count > 0 ? total / count : 0;
    }

    return Number((globalClassAverage - newGlobalAverage).toFixed(2));
  }, [subjectClassAverages, globalClassAverage, getSubjectById]);

  return {
    getAvgInfluence,
    getAvgClassInfluence
  };
};
