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

  const subjectWeights = useMemo(() => {
    const weights: Record<string, number> = {};
    subjects.forEach(subject => {
      weights[subject.id] = subject.coefficient && subject.coefficient > 0
        ? subject.coefficient
        : 1;
    });
    return weights;
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
    let totalWeight = 0;
    Object.entries(subjectAverages).forEach(([id, avg]) => {
      if (avg !== -1) {
        const weight = subjectWeights[id] ?? 1;
        total += avg * weight;
        totalWeight += weight;
      }
    });
    return totalWeight > 0 ? total / totalWeight : 0;
  }, [subjectAverages, subjectWeights]);

  const globalClassAverage = useMemo(() => {
    let total = 0;
    let totalWeight = 0;
    Object.entries(subjectClassAverages).forEach(([id, avg]) => {
      if (avg !== -1) {
        const weight = subjectWeights[id] ?? 1;
        total += avg * weight;
        totalWeight += weight;
      }
    });
    return totalWeight > 0 ? total / totalWeight : 0;
  }, [subjectClassAverages, subjectWeights]);

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
      let totalWeight = 0;
      Object.entries(subjectAverages).forEach(([id, avg]) => {
        if (id !== subjectId && avg !== -1) {
          const weight = subjectWeights[id] ?? 1;
          total += avg * weight;
          totalWeight += weight;
        }
      });
      newGlobalAverage = totalWeight > 0 ? total / totalWeight : 0;
    } else {
      // Subject average changes
      let total = 0;
      let totalWeight = 0;
      Object.entries(subjectAverages).forEach(([id, avg]) => {
        if (id !== subjectId && avg !== -1) {
          const weight = subjectWeights[id] ?? 1;
          total += avg * weight;
          totalWeight += weight;
        }
      });
      // Add the new subject average
      const currentSubjectWeight = subjectWeights[subjectId] ?? 1;
      total += newSubjectAvg * currentSubjectWeight;
      totalWeight += currentSubjectWeight;
      newGlobalAverage = totalWeight > 0 ? total / totalWeight : 0;
    }

    return Number((globalAverage - newGlobalAverage).toFixed(2));
  }, [subjectAverages, subjectWeights, globalAverage, getSubjectById]);

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
      let totalWeight = 0;
      Object.entries(subjectClassAverages).forEach(([id, avg]) => {
        if (id !== subjectId && avg !== -1) {
          const weight = subjectWeights[id] ?? 1;
          total += avg * weight;
          totalWeight += weight;
        }
      });
      newGlobalAverage = totalWeight > 0 ? total / totalWeight : 0;
    } else {
      let total = 0;
      let totalWeight = 0;
      Object.entries(subjectClassAverages).forEach(([id, avg]) => {
        if (id !== subjectId && avg !== -1) {
          const weight = subjectWeights[id] ?? 1;
          total += avg * weight;
          totalWeight += weight;
        }
      });
      const currentSubjectWeight = subjectWeights[subjectId] ?? 1;
      total += newSubjectAvg * currentSubjectWeight;
      totalWeight += currentSubjectWeight;
      newGlobalAverage = totalWeight > 0 ? total / totalWeight : 0;
    }

    return Number((globalClassAverage - newGlobalAverage).toFixed(2));
  }, [subjectClassAverages, subjectWeights, globalClassAverage, getSubjectById]);

  return {
    getAvgInfluence,
    getAvgClassInfluence
  };
};
