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
  @field('studentAverage') studentAverageRaw: string;
  @field('classAverage') classAverageRaw: string;
  @field('maximum') maximumRaw: string;
  @field('minimum') minimumRaw: string;
  @field('outOf') outOfRaw: string;
  @field('periodGradeId') periodGradeId: string;

  @relation('periodgrades', 'periodGradeId') periodGrade: PeriodGrades;
  @children('grades') grades: Grade[];

  get studentAverage(): GradeScore {
    return JSON.parse(this.studentAverageRaw || '{}');
  }

  get classAverage(): GradeScore {
    return JSON.parse(this.classAverageRaw || '{}');
  }

  get maximum(): GradeScore {
    return JSON.parse(this.maximumRaw || '{}');
  }

  get minimum(): GradeScore {
    return JSON.parse(this.minimumRaw || '{}');
  }

  get outOf(): GradeScore {
    return JSON.parse(this.outOfRaw || '{}');
  }
}
