import { AverageOverview, Grade, GradeInformation, GradeValue } from "@/services/shared/Grade";
import type { SkolengoAccount } from "@/stores/account/types";
import { getPeriod } from "./period";
import { ErrorServiceUnauthenticated } from "@/services/shared/errors";
import { Evaluation, EvaluationDetail } from "scolengo-api/types/models/Results";

const SKOLENGO_DEFAULT_SCALE = 20;

const decodeGradeNumber = (value?:number | null): GradeValue =>
  typeof value === "number" ?
    { value, disabled: false }
    : { value: null, disabled: true };

const getSubjectMinMax = (evalSubj: Evaluation): {min: GradeValue, max:GradeValue, outOf: GradeValue} => {
  const outOf = decodeGradeNumber(evalSubj.scale || SKOLENGO_DEFAULT_SCALE);
  if(evalSubj.evaluations.filter(e=>e.evaluationResult.mark !== null && !e.evaluationResult.nonEvaluationReason).length === 0) return {min: { value: null, disabled: true } , max: { value: null, disabled: true }, outOf};
  const [minimum, maximum] = evalSubj.evaluations.filter(e=>e.evaluationResult.mark !== null)
    .map(e=>((e.evaluationResult.mark!)/(e.scale || SKOLENGO_DEFAULT_SCALE)) * (evalSubj.scale || SKOLENGO_DEFAULT_SCALE))
    .reduce(([minAcc, maxAcc], e) => [Math.min(minAcc, e), Math.max(maxAcc, e)], [evalSubj.scale || SKOLENGO_DEFAULT_SCALE, 0]);
  return {min: { value: minimum, disabled: false } , max: { value: maximum, disabled: false }, outOf};
};

const getOverall = (evals: Evaluation[]): GradeValue =>{
  if(evals.filter(e=>e.average !== null).length === 0)
    return { value: null, disabled: true };
  const sum = evals.filter(e=>e.average !== null).reduce((acc, e) => acc + (e.average! * (e.coefficient || 1)), 0);
  const sumCoef = evals.filter(e=>e.average !== null).reduce((acc, e) => acc + (e.coefficient || 1), 0);
  return { value: sum / sumCoef, disabled: false };
};

export const getGradesAndAverages = async (account: SkolengoAccount, periodName: string): Promise<{
  grades: Grade[],
  averages: AverageOverview
}> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("skolengo");

  const periods = await getPeriod(account);
  const period = periods.find(p => p.name === periodName);
  if (!period)
    throw new Error("La période sélectionnée n'a pas été trouvée.");

  const evals = await account.instance.getEvaluation(undefined, period.id);

  const averages: AverageOverview = {
    classOverall: { value: 0, disabled: true },
    overall: { value: 0, disabled: true },
    subjects: evals.map((s) => ({
      classAverage: decodeGradeNumber(s.average),
      color: s.subject.color || "#888",
      subjectName: s.subject.label,
      average: decodeGradeNumber(s.studentAverage),
      ...getSubjectMinMax(s),
    })),
  };

  const grades: Grade[] = evals.map(e=>e.evaluations.map(f=>({...f, evaluation: e}))).flat().map(g => ({
    id: g.id,
    subjectName: g.evaluation.subject.label,
    description: g.title || g.topic || "Evaluation",
    timestamp: g.dateTime ? (new Date(g.dateTime)).getTime() : period.startTimestamp,

    // Not implemented in Skolengo
    isBonus: false,
    isOptional: false,

    outOf: decodeGradeNumber(g.scale),
    coefficient: g.coefficient || 1,

    student: decodeGradeNumber(g.evaluationResult.mark),
    average: decodeGradeNumber(g.average),
    max: decodeGradeNumber(g.max),
    min: decodeGradeNumber(g.min)
  }));

  return { averages, grades };
};