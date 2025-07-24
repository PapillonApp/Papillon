// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field, relation } from "@nozbe/watermelondb/decorators";

import { Grade } from './Grades';

export default class Subject extends Model {
  static table = 'subjects';

  @field('subjectId') subjectId: string;
  @field('name') name: string;
  @field('studentAverage') studentAverage: string;
  @field('classAverage') classAverage: string;
  @field('maximum') maximum: string;
  @field('minimum') minimum: string;
  @field('outOf') outOf: string;
  @field('periodGradeId') periodGradeId: string;

  @relation('periodgrades', 'periodGradeId') periodGrade: PeriodGrades;
  @children('grades') grades: Grade[];
}
