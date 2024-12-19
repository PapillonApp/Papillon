export interface Evaluation {
  id: string;
  name: string;
  subjectId?: string;
  subjectName: string;
  description: string;
  timestamp: number;
  coefficient: number;
  levels: Array<String>;
  skills: Array<Skill>;
  teacher: string;
}

export enum SkillLevel {
  NotReturned = -3,      // Non rendu
  Dispensed = -2,        // Dispensé
  Absent = -1,           // Absent
  None = 0,              // Aucune évaluation
  Insufficient = 1,      // Maîtrise insuffisante
  Beginning = 2,         // Début de maîtrise
  Fragile = 3,           // Maîtrise fragile
  AlmostMastered = 4,    // Presque maîtrisé
  Satisfactory = 5,      // Maîtrise satisfaisante
  Excellent = 6          // Très bonne maîtrise
}

export interface Skill {
  coefficient: number;
  level: SkillLevel;
  pillarPrefixes: Array<string>;
  domainName: string;
  itemName: string;
}

export interface EvaluationsPerSubject {
  subjectName: string;
  evaluations: Array<Evaluation>;
}