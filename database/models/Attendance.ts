// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { children, field, relation } from '@nozbe/watermelondb/decorators';

export class Attendance extends Model {
  static table = "attendance";

  @field('createdByAccount') createdByAccount: string;
  @field('period') period: string;

  @children('delays') delays!: Relation<Delay>;
  @children('absences') absences!: Relation<Absence>;
  @children('observations') observations!: Relation<Observation>;
  @children('punishments') punishments!: Relation<Punishment>;
}

export class Delay extends Model {
  static table = "delays";

  @field('givenAt') givenAt: number;
  @field('reason') reason?: string;
  @field('justified') justified: boolean;
  @field('duration') duration: number;
  @relation('attendance', 'attendanceId') attendance: Attendance;
}

export class Observation extends Model {
  static table = "observations";

  @field('givenAt') givenAt: number;
  @field('sectionName') sectionName: string;
  @field('sectionType') sectionType: number;
  @field('subjectName') subjectName?: string;
  @field('shouldParentsJustify') shouldParentsJustify: boolean;
  @field('reason') reason?: string;
  @relation('attendance', 'attendanceId') attendance: Attendance;
}

export class Absence extends Model {
  static table = "absences";

  @field('from') from: number;
  @field('to') to: number;
  @field('reason') reason?: string;
  @field('justified') justified: boolean;
  @relation('attendance', 'attendanceId') attendance: Attendance;
}

export class Punishment extends Model {
  static table = "punishments";

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
  @relation('attendance', 'attendanceId') attendance: Attendance;

  get homeworkDocuments(): Attachment[] {
    return JSON.parse(this.homeworkDocumentsRaw);
  }

  get reasonDocuments(): Attachment[] {
    return JSON.parse(this.reasonDocumentsRaw);
  }
}