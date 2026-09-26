// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { children, field, relation } from '@nozbe/watermelondb/decorators';

import { Attachment } from '@/services/shared/attachment';

export class Attendance extends Model {
  static table = "attendance";

  static associations = {
    delays: { type: 'has_many', foreignKey: 'attendanceId' },
    absences: { type: 'has_many', foreignKey: 'attendanceId' },
    observations: { type: 'has_many', foreignKey: 'attendanceId' },
    punishments: { type: 'has_many', foreignKey: 'attendanceId' },
  };
  
  @field('attendanceId') attendanceId: string;
  @field('createdByAccount') createdByAccount: string;
	@field('kidName') kidName?: string;
  @field('period') period: string;

  @children('delays') delays!: Query<Delay>;
  @children('absences') absences!: Query<Absence>;
  @children('observations') observations!: Query<Observation>;
  @children('punishments') punishments!: Query<Punishment>;
}

export class Delay extends Model {
  static table = "delays";

  static associations = {
    attendance: { type: 'belongs_to', key: 'attendanceId' },
  };

  @field('givenAt') givenAt: number;
  @field('reason') reason?: string;
  @field('justified') justified: boolean;
  @field('duration') duration: number;
  @field('attendanceId') attendanceId: string;
	@field('kidName') kidName: string;
  @relation('attendance', 'attendanceId') attendance: Attendance;
}

export class Observation extends Model {
  static table = "observations";

  static associations = {
    attendance: { type: 'belongs_to', key: 'attendanceId' },
  };

  @field('givenAt') givenAt: number;
  @field('sectionName') sectionName: string;
  @field('sectionType') sectionType: number;
  @field('subjectName') subjectName?: string;
  @field('shouldParentsJustify') shouldParentsJustify: boolean;
  @field('reason') reason?: string;
  @field('attendanceId') attendanceId: string;
  @relation('attendance', 'attendanceId') attendance: Attendance;
}

export class Absence extends Model {
  static table = "absences";

  static associations = {
    attendance: { type: 'belongs_to', key: 'attendanceId' },
  };

  @field('from') from: number;
  @field('to') to: number;
  @field('reason') reason?: string;
  @field('justified') justified: boolean;
  @field('attendanceId') attendanceId: string;
	@field('kidName') kidName: string;
  @relation('attendance', 'attendanceId') attendance: Attendance;
}

export class Punishment extends Model {
  static table = "punishments";

  static associations = {
    attendance: { type: 'belongs_to', key: 'attendanceId' },
  };

  @field('givenAt') givenAt: number;
  @field('givenBy') givenBy: string;
  @field('exclusion') exclusion: boolean;
  @field('duringLesson') duringLesson: boolean;
  @field('nature') nature: string;
  @field('duration') duration: number;

  @field('homeworkDocumentsRaw') homeworkDocumentsRaw: string;
  @field('reasonDocumentsRaw') reasonDocumentsRaw: string;
  @field('homeworkText') homeworkText: string;
  @field('reasonText') reasonText: string;
  @field('reasonCircumstances') reasonCircumstances: string;
  @field('attendanceId') attendanceId: string;
  @relation('attendance', 'attendanceId') attendance: Attendance;

  get homeworkDocuments(): Attachment[] {
    return JSON.parse(this.homeworkDocumentsRaw);
  }

  get reasonDocuments(): Attachment[] {
    return JSON.parse(this.reasonDocumentsRaw);
  }
}