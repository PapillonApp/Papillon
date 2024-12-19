import type {PronoteAccount} from "@/stores/account/types";
import type {Period} from "@/services/shared/Period";
import {info} from "@/utils/logger/logger";
import {decodePeriod} from "@/services/pronote/period";
import pronote from "pawnote";
import {ErrorServiceUnauthenticated} from "@/services/shared/errors";
import {Evaluation, SkillLevel} from "@/services/shared/Evaluation";

const getTab = (account: PronoteAccount): pronote.Tab => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const tab = account.instance.user.resources[0].tabs.get(pronote.TabLocation.Evaluations);
  if (!tab)
    throw new Error("Vous n'avez pas accès à l'onglet 'Compétences' dans PRONOTE");

  return tab;
};

export const getEvaluationsPeriods = (account: PronoteAccount): { periods: Period[], default: string } => {
  const tab = getTab(account);
  info("PRONOTE->getEvaluationsPeriods(): OK", "pronote");

  return {
    default: tab.defaultPeriod!.name,
    periods: tab.periods.map(decodePeriod)
  };
};

export const getEvaluations = async (account: PronoteAccount, periodName: string): Promise<Array<Evaluation>> => {
  const tab = getTab(account); // Vérifie aussi la validité de `account.instance`.
  const period = tab.periods.find(p => p.name === periodName);
  if (!period)
    throw new Error("La période sélectionnée n'a pas été trouvée.");

  const overview = await pronote.evaluations(account.instance!, period);

  const evaluations: Array<Evaluation> = overview.map(e => ({
    id: buildLocalID(e),
    name: e.name,
    subjectId: e.subject.id,
    subjectName: e.subject.name,
    description: e.description,
    timestamp: e.date.getTime(),
    coefficient: e.coefficient,
    levels: e.levels,
    skills: e.skills.map(s => ({
      coefficient: s.coefficient,
      level: getLevel(s.abbreviation),
      domainName: s.domainName,
      itemName: s.itemName || "Compétence sans nom",
      pillarPrefixes: s.pillarPrefixes,
    })),
    teacher: e.teacher
  }));

  return evaluations;
};

export const getLevel = (level: string): SkillLevel => {
  switch (level) {
    case "Nr":
      return SkillLevel.NotReturned;
    case "Dsp":
      return SkillLevel.Dispensed;
    case "Abs":
      return SkillLevel.Absent;
    case "E":
      return SkillLevel.Insufficient;
    case "D":
      return SkillLevel.Beginning;
    case "C":
      return SkillLevel.Fragile;
    case "B":
      return SkillLevel.AlmostMastered;
    case "A":
      return SkillLevel.Satisfactory;
    case "A+":
      return SkillLevel.Excellent;
    default:
      return SkillLevel.None;
  }
};

export const buildLocalID = (e: pronote.Evaluation): string => `${e.subject.name}:${e.date.getTime()}/${e.name}`;