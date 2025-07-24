// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field, relation } from "@nozbe/watermelondb/decorators";

import { GradeScore } from '@/services/shared/grade';

import { Grade } from './Grades';

export default class Subject extends Model {
  static table = 'subjects';

  @field('subjectId') subjectId: string;
  @field('name') name: string;
  @field('studentAverage') studentAverage: GradeScore;
  @field('classAverage') classAverage: GradeScore;
  @field('maximum') maximum: GradeScore;
  @field('minimum') minimum: GradeScore;
  @field('outOf') outOf: GradeScore;
  @field('periodGradeId') periodGradeId: string;

  @relation('periodgrades', 'periodGradeId') periodGrade: PeriodGrades;
  @children('grades') grades: Grade[];
}
