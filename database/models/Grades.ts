// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { children, field } from "@nozbe/watermelondb/decorators";

import { GradeScore } from '@/services/shared/grade';

import Subject from './Subject';

export class Period extends Model {
  static table = 'periods';

  @field('createdByAccount') createdByAccount: string;
  @field('name') name: string;
  @field('id') id: string;
  @field('start') start: number;
  @field('end') end: number;
  @children('periodgrades') grades: PeriodGrades[];
}

export class Grade extends Model {
  static table = 'grades'

  @field('createByAccount') createdByAccount: string;
  @field('id') id: string;
  @field('subjectId') subjectId?: string;
  @relation('subjects', 'subjectId') subject: Subject;
  @field('description') description: string;
  @field('givenAt') givenAt: number;
  @field('subjectFile') subjectFile?: string;
  @field('correctionFile') correctionFile?: string;
  @field('bonus') bonus?: boolean;
  @field('optional') optional?: boolean;
  @field('outOf') outOf: GradeScore;
  @field('coefficient') coefficient: number;
  @field('studentScore') studentScore: GradeScore;
  @field('averageScore') averageScore: GradeScore;
  @field('minScore') minScore: GradeScore;
  @field('maxScore') maxScore: GradeScore;
}

export class PeriodGrades extends Model {
  static table = 'periodgrades';

  @field('id') id: string;
  @field('createdByAccount') createdByAccount: string;
  @field('studentOverall') studentOverall: GradeScore;
  @field('classAverage') classAverage: GradeScore;
  @field('periodId') periodId: string;

  @relation('periods', 'periodId') period: Period;
  @children('subjects') subjects: Subject[];
}
