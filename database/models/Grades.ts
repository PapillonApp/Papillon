// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { children, field } from "@nozbe/watermelondb/decorators";

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

  @field('createdByAccount') createdByAccount: string;
  @field('id') id: string;
  @relation('subjects', 'subjectId') subject: Subject;
  @field('description') description: string;
  @field('givenAt') givenAt: number;
  @field('subjectFile') subjectFile?: string;
  @field('correctionFile') correctionFile?: string;
  @field('bonus') bonus?: boolean;
  @field('optional') optional?: boolean;
  @field('coefficient') coefficient: number;
	@field('outOf') outOfRaw: string;
	@field('studentScore') studentScoreRaw: string;
	@field('averageScore') averageScoreRaw: string;
	@field('minScore') minScoreRaw: string;
	@field('maxScore') maxScoreRaw: string;

	get outOf(): GradeScore {
	  return JSON.parse(this.outOfRaw || '{}');
	}

	get studentScore(): GradeScore {
	  return JSON.parse(this.studentScoreRaw || '{}');
	}

	get averageScore(): GradeScore {
	  return JSON.parse(this.averageScoreRaw || '{}');
	}

	get minScore(): GradeScore {
	  return JSON.parse(this.minScoreRaw || '{}');
	}

	get maxScore(): GradeScore {
	  return JSON.parse(this.maxScoreRaw || '{}');
	}
}

export class PeriodGrades extends Model {
  static table = 'periodgrades';

  @field('id') id: string;
  @field('createdByAccount') createdByAccount: string;
  @field('studentOverall') studentOverallRaw: string;
  @field('classAverage') classAverageRaw: string;
  @field('periodId') periodId: string;

  @relation('periods', 'periodId') period: Period;
  @children('subjects') subjects: Subject[];

  get studentOverall(): GradeScore {
    return JSON.parse(this.studentOverallRaw || '{}');
  }

  get classAverage(): GradeScore {
    return JSON.parse(this.classAverageRaw || '{}');
  }
}
